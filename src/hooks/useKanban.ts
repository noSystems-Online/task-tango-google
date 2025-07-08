import { useState } from "react";
import { Task, Column, Priority } from "@/types/kanban";
import { supabase } from "@/integrations/supabase/client";

export function useKanban(initialColumns: Column[]) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const uploadFiles = async (files: File[]) => {
    if (!files || files.length === 0) return [];
    const urls: string[] = [];
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("task-attachments")
        .upload(fileName, file);
      if (error) {
        console.error("Error uploading file:", error);
        continue;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("task-attachments").getPublicUrl(fileName);
      if (publicUrl) urls.push(publicUrl);
    }
    return urls;
  };

  const createTask = async (
    columnId: string,
    title: string,
    description?: string,
    priority: Priority = "medium",
    files?: File[]
  ) => {
    let attachmentUrls: string[] = [];
    if (files && files.length > 0) {
      attachmentUrls = await uploadFiles(files);
    }

    // Insert task into Supabase
    // You must provide project_id, user_id for insert
    // Find the column to get project_id
    const column = columns.find((col) => col.id === columnId);
    if (!column) throw new Error("Column not found");
    // Get current user from Supabase auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("No authenticated user found.");
    }
    const user_id = user.id;
    const project_id = column.project_id;
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          column_id: columnId,
          project_id,
          user_id,
          title,
          description,
          status: column.status,
          priority,
        },
      ])
      .select()
      .single();
    if (error) {
      throw error;
    }

    const newTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as import("@/types/kanban").TaskStatus,
      priority: data.priority as import("@/types/kanban").Priority,
      attachmentUrls: undefined,
      assignee: data.assignee,
      tags: undefined,
      comments: undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setColumns((prev) =>
      prev.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )
    );

    return newTask;
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<Task>,
    files?: File[]
  ) => {
    let attachmentUrls: string[] | undefined = undefined;
    if (files && files.length > 0) {
      attachmentUrls = await uploadFiles(files);
    }

    const finalUpdates: Partial<Task> = { ...updates };
    if (attachmentUrls && attachmentUrls.length > 0) {
      finalUpdates.attachmentUrls = attachmentUrls;
    }

    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) =>
          task.id === taskId
            ? { ...task, ...finalUpdates, updatedAt: new Date().toISOString() }
            : task
        ),
      }))
    );
  };

  const deleteTask = async (taskId: string) => {
    // Save previous state for rollback
    const prevColumns = columns;
    // Optimistically update UI
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    );

    // Delete from Supabase
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      // Rollback UI state
      setColumns(prevColumns);
      // Optionally: show error to user (could use toast/snackbar)
      // eslint-disable-next-line no-console
      console.error("Failed to delete task:", error.message || error);
      throw error;
    }
  };

  const moveTask = async (
    taskId: string,
    fromColumnId: string,
    toColumnId: string
  ) => {
    const task = columns
      .find((col) => col.id === fromColumnId)
      ?.tasks.find((t) => t.id === taskId);

    if (!task) return;

    const newStatus = columns.find((col) => col.id === toColumnId)?.status;
    if (!newStatus) return;

    // Optimistically update UI first
    // Save previous state for rollback
    const prevColumns = columns;

    setColumns((prev) =>
      prev.map((column) => {
        if (column.id === fromColumnId) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== taskId),
          };
        }
        if (column.id === toColumnId) {
          return {
            ...column,
            tasks: [
              ...column.tasks,
              {
                ...task,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              },
            ],
          };
        }
        return column;
      })
    );

    // Update task in Supabase (background)
    const { error } = await supabase
      .from("tasks")
      .update({
        column_id: toColumnId,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);
    if (error) {
      // Rollback UI state
      setColumns(prevColumns);
      // Optionally: show error to user (could use toast/snackbar)
      // eslint-disable-next-line no-console
      console.error("Failed to move task:", error.message || error);
      throw error;
    }
  };

  // Add reorderColumns for column drag-and-drop
  const reorderColumns = async (newOrder: Column[]) => {
    // Update order in Supabase (update each column's order field)
    for (let idx = 0; idx < newOrder.length; idx++) {
      const col = newOrder[idx];
      await supabase.from("columns").update({ order: idx }).eq("id", col.id);
    }
    setColumns(newOrder);
  };

  return {
    columns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderColumns,
  };
}
