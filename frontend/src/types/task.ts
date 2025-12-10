export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskComment {
  id: string;
  content: string;
  authorEmail: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assigneeEmail: string;
  dueDate?: string | null;
  comments: TaskComment[];
}
