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

export type TaskStatus = "todo" | "in-progress" | "review" | "done";

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
    id: "review",
    title: "Review",
    status: "review",
    color: "status-review",
    project_id: "",
  },
  {
    id: "done",
    title: "Done",
    status: "done",
    color: "status-done",
    project_id: "",
  },
];
