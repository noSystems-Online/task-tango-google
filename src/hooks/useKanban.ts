import { useState } from "react";
import { Task, Column, Priority } from "@/types/kanban";
import { supabase } from "@/integrations/supabase/client";

export function useKanban(initialColumns: Column[]) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const uploadFile = async (file: File) => {
    if (!file) return null;

    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("task-attachments")
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("task-attachments").getPublicUrl(fileName);

    return publicUrl;
  };

  const createTask = async (
    columnId: string,
    title: string,
    description?: string,
    priority: Priority = "medium",
    attachment?: File
  ) => {
    let attachmentUrl: string | undefined = undefined;
    if (attachment) {
      attachmentUrl = (await uploadFile(attachment)) || undefined;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      status: columns.find((col) => col.id === columnId)?.status || "todo",
      priority,
      attachmentUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    updates: Partial<Task> & { attachment?: File }
  ) => {
    const { attachment, ...restUpdates } = updates;
    let attachmentUrl: string | undefined = undefined;
    if (attachment) {
      attachmentUrl = (await uploadFile(attachment)) || undefined;
    }

    const finalUpdates: Partial<Task> = { ...restUpdates };
    if (attachmentUrl) {
      finalUpdates.attachmentUrl = attachmentUrl;
    }

    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.map((task) =>
          task.id === taskId
            ? { ...task, ...finalUpdates, updatedAt: new Date() }
            : task
        ),
      }))
    );
  };

  const deleteTask = (taskId: string) => {
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    );
  };

  const moveTask = (
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

    // Remove task from source column and add to destination column
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
              { ...task, status: newStatus, updatedAt: new Date() },
            ],
          };
        }
        return column;
      })
    );
  };

  return {
    columns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
