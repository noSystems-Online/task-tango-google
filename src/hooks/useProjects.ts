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

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, description, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        setProjects([]);
        return;
      }
      if (!projectsData) {
        setProjects([]);
        return;
      }

      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase
        .from("columns")
        .select("id, title, status, color, project_id")
        .order("id");
      if (columnsError) {
        console.error("Error fetching columns:", columnsError);
        setProjects([]);
        return;
      }

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select(
          "id, title, description, status, priority, assignee, created_at, updated_at, column_id"
        )
        .order("created_at");
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        setProjects([]);
        return;
      }

      // Compose columns with tasks
      const columnsWithTasks = (columnsData || []).map((col) => ({
        id: col.id,
        title: col.title,
        status: col.status as TaskStatus,
        color: col.color,
        project_id: col.project_id,
        tasks: Array.isArray(tasksData)
          ? tasksData
              .filter(isTaskRow)
              .filter((t) => t.column_id === col.id)
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
    };
    fetchAll();
  }, []);

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
          tasks: [],
        })),
      },
    ]);
    return projectData;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      )
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  };

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
  };
}
