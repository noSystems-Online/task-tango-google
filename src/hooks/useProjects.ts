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

  const createProject = (name: string, description?: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      columns: DEFAULT_COLUMNS.map((col) => ({ ...col, tasks: [] })),
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
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
