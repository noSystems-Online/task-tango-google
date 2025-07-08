import { createContext } from "react";
import type { Project } from "@/types/kanban";
import type { useProjects } from "@/hooks/useProjects";

export interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  createProject: ReturnType<typeof useProjects>["createProject"];
  editProject: ReturnType<typeof useProjects>["editProject"];
  deleteProject: ReturnType<typeof useProjects>["deleteProject"];
  addColumn: ReturnType<typeof useProjects>["addColumn"];
  deleteColumn: ReturnType<typeof useProjects>["deleteColumn"];
  reorderColumns: ReturnType<typeof useProjects>["reorderColumns"];
  fetchAll: ReturnType<typeof useProjects>["fetchAll"];
}

export const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined
);
