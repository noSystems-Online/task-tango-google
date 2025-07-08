export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  columns: Column[];
}

export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export type Priority = "low" | "medium" | "high" | "urgent";

export const DEFAULT_COLUMNS: Omit<Column, "tasks">[] = [
  {
    id: "todo",
    title: "To Do",
    status: "todo",
    color: "status-todo",
  },
  {
    id: "in-progress",
    title: "In Progress",
    status: "in-progress",
    color: "status-progress",
  },
  {
    id: "review",
    title: "Review",
    status: "review",
    color: "status-review",
  },
  {
    id: "done",
    title: "Done",
    status: "done",
    color: "status-done",
  },
];
