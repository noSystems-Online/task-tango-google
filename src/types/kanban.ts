export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority?: Priority;
  assignee?: string | null;
  tags?: string[];
  attachmentUrls?: string[] | null;
  comments?: Comment[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  order: number; // Order within the column for drag-and-drop
}

export interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
  project_id: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  columns: Column[];
}

export type TaskStatus = "todo" | "in-progress" | "done" | "deployed";

export type Priority = "low" | "medium" | "high" | "urgent";

// You must provide project_id when using these defaults
export const DEFAULT_COLUMNS: Omit<Column, "tasks">[] = [
  {
    id: "todo",
    title: "To Do",
    status: "todo",
    color: "status-todo",
    project_id: "",
  },
  {
    id: "in-progress",
    title: "In Progress",
    status: "in-progress",
    color: "status-progress",
    project_id: "",
  },
  {
    id: "done",
    title: "Done",
    status: "done",
    color: "status-done",
    project_id: "",
  },
  {
    id: "deployed",
    title: "Deployed",
    status: "deployed",
    color: "status-deployed",
    project_id: "",
  },
];
