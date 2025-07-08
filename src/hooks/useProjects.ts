import type { Database } from "@/integrations/supabase/types";
// Type guard for valid task rows
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
function isTaskRow(t: unknown): t is TaskRow {
  return t !== null && typeof t === "object" && "id" in t && "column_id" in t;
}
import { useState, useEffect } from "react";
import {
  Project,
  Task,
  Column,
  DEFAULT_COLUMNS,
  TaskStatus,
  Priority,
} from "@/types/kanban";
import { supabase } from "@/integrations/supabase/client";

// Patch the Column type to include 'order' property for type safety
export interface ColumnWithOrder extends Column {
  order: number;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Expose fetchAll for context usage
  const fetchAll = async () => {
    setLoading(true);
    // Fetch projects
    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("id, name, description, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (projectsError) {
      console.error("Error fetching projects:", projectsError);
      setProjects([]);
      setLoading(false);
      return;
    }
    if (!projectsData) {
      setProjects([]);
      setLoading(false);
      return;
    }

    // Fetch columns
    const { data: columnsData, error: columnsError } = await supabase
      .from("columns")
      .select("id, title, status, color, project_id, order")
      .order("order", { ascending: true });
    if (columnsError) {
      console.error("Error fetching columns:", columnsError);
      setProjects([]);
      setLoading(false);
      return;
    }

    // Fetch tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select(
        "id, title, description, status, priority, assignee, created_at, updated_at, column_id, deleted"
      )
      .order("created_at");
    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      setProjects([]);
      setLoading(false);
      return;
    }

    // Compose columns with tasks, and sort columns by desired order
    const columnsWithTasks = (columnsData || []).map((col) => ({
      id: col.id,
      title: col.title,
      status: col.status as TaskStatus,
      color: col.color,
      project_id: col.project_id,
      order: col.order ?? 0,
      tasks: Array.isArray(tasksData)
        ? tasksData
            .filter(isTaskRow)
            .filter((t) => t.column_id === col.id && !t.deleted)
            .map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              status: t.status as TaskStatus,
              priority: t.priority as Priority,
              assignee: t.assignee,
              tags: undefined,
              attachmentUrls: undefined,
              comments: undefined,
              createdAt: t.created_at,
              updatedAt: t.updated_at,
            }))
        : [],
    }));

    // Compose projects with columns
    setProjects(
      (projectsData || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        columns: columnsWithTasks.filter((col) => col.project_id === p.id),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);
  const deleteProject = async (projectId: string) => {
    // Delete project from Supabase (will cascade to columns/tasks if set up)
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);
    if (error) {
      console.error("Error deleting project:", error);
      return;
    }
    // Always refetch after deletion to ensure global sync
    await fetchAll();
  };

  const createProject = async (name: string, description?: string) => {
    // Get current user from Supabase auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("No authenticated user found.", userError);
      return null;
    }
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .insert([
        {
          name,
          description: description || null,
          user_id: user.id,
        },
      ])
      .select()
      .single();
    if (projectError || !projectData) {
      console.error("Error creating project:", projectError);
      return null;
    }

    // Insert default columns for this project
    const now = new Date().toISOString();
    const columnsToInsert = DEFAULT_COLUMNS.map((col) => ({
      title: col.title,
      status: col.status,
      color: col.color,
      project_id: projectData.id,
      created_at: now,
      updated_at: now,
    }));
    const { data: columnsData, error: columnsError } = await supabase
      .from("columns")
      .insert(columnsToInsert)
      .select();
    if (columnsError) {
      console.error("Error creating columns:", columnsError);
    }

    // Optionally, you can fetch the updated list or append to local state
    // For now, just trigger a refetch by calling fetchAll
    // (Or you can push to setProjects if you want instant UI update)
    // await fetchAll();
    // Or, for instant update:
    setProjects((prev) => [
      ...prev,
      {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at,
        columns: (columnsData || []).map((col) => ({
          id: col.id,
          title: col.title,
          status: col.status as TaskStatus,
          color: col.color,
          project_id: col.project_id,
          order: col.order ?? 0,
          tasks: [],
        })),
      },
    ]);
    return projectData;
  };

  /**
   * Update a project in Supabase and local state.
   * @param projectId The project ID to update
   * @param updates Object with name and/or description
   */
  const editProject = async (
    projectId: string,
    updates: { name?: string; description?: string | null }
  ) => {
    const { data, error } = await supabase
      .from("projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();
    if (error) {
      console.error("Error updating project:", error);
      return null;
    }
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              name: data.name,
              description: data.description,
              updatedAt: data.updated_at,
            }
          : project
      )
    );
    return data;
  };

  // Add a new column to a project in Supabase and update local state
  const addColumn = async (
    projectId: string,
    column: { title: string; status: string; color: string }
  ) => {
    // Find the current max order for this project's columns
    const project = projects.find((p) => p.id === projectId);
    const maxOrder =
      project && project.columns.length > 0
        ? Math.max(
            ...project.columns.map((c) =>
              "order" in c && typeof c.order === "number" ? c.order : 0
            )
          )
        : 0;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("columns")
      .insert([
        {
          title: column.title,
          status: column.status,
          color: column.color,
          project_id: projectId,
          order: maxOrder + 1,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();
    if (error || !data) {
      console.error("Error adding column:", error);
      return null;
    }
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              columns: [
                ...project.columns,
                {
                  id: data.id,
                  title: data.title,
                  status: data.status as TaskStatus,
                  color: data.color,
                  project_id: data.project_id,
                  order: data.order ?? maxOrder + 1,
                  tasks: [],
                },
              ],
            }
          : project
      )
    );
    return data;
  };

  // Delete a column from Supabase and update local state
  const deleteColumn = async (columnId: string, projectId: string) => {
    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId);
    if (error) {
      console.error("Error deleting column:", error);
      return false;
    }
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              columns: project.columns.filter((col) => col.id !== columnId),
            }
          : project
      )
    );
    return true;
  };

  // Reorder columns in Supabase and update local state
  const reorderColumns = async (projectId: string, newOrder: string[]) => {
    // Find the current project and its columns
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    // Build full update objects for upsert
    const updates = newOrder
      .map((id, idx) => {
        const col = project.columns.find((col) => col.id === id);
        if (!col) return null;
        return {
          id: col.id,
          project_id: col.project_id,
          title: col.title,
          status: col.status,
          color: col.color,
          order: idx,
          // Optionally include timestamps if required by your schema
          // created_at: col.createdAt,
          // updated_at: new Date().toISOString(),
        };
      })
      .filter(Boolean);
    if (updates.length === 0) return;
    const { error } = await supabase.from("columns").upsert(updates);
    if (error) {
      console.error("Error reordering columns:", error);
    }
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              columns: newOrder
                .map((id, idx) => {
                  const col = project.columns.find((col) => col.id === id);
                  return col ? { ...col, order: idx } : undefined;
                })
                .filter(Boolean) as Column[],
            }
          : project
      )
    );
  };

  return {
    projects,
    loading,
    createProject,
    editProject,
    deleteProject,
    addColumn,
    deleteColumn,
    reorderColumns,
    fetchAll, // Expose fetchAll for context
  };
}
