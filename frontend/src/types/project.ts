export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  taskCount: number;
  completedTasks: number;
  dueDate?: string | null;
}
