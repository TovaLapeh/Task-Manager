/**
 * Mirrors the server-side model (server/src/models/task.model.ts). The two
 * projects are deployed and typechecked independently, so the interface is
 * duplicated rather than shared via a package — see README "Architectural
 * decisions" for the reasoning.
 */
export enum TaskPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

export enum TaskStatus {
  Pending = "Pending",
  InProgress = "In Progress",
  Completed = "Completed",
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string; // ISO date string (yyyy-MM-dd)
  status: TaskStatus;
}

/** Payload sent to the API when creating or updating a task. */
export type TaskInput = Omit<Task, "id">;

export const TASK_PRIORITIES: TaskPriority[] = [TaskPriority.Low, TaskPriority.Medium, TaskPriority.High];

export const TASK_STATUSES: TaskStatus[] = [TaskStatus.Pending, TaskStatus.InProgress, TaskStatus.Completed];
