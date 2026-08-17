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

/** Shape accepted from the client on create/update, before an id is assigned. */
export type TaskInput = Omit<Task, "id">;
