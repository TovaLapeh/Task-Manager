import { Task, TaskInput, TaskPriority, TaskStatus } from "../models/task.model";
import { NotFoundError, ValidationError } from "../models/errors";
import { readTasks, writeTasks } from "../persistence/task.repository";

const PRIORITIES = Object.values(TaskPriority);
const STATUSES = Object.values(TaskStatus);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates and normalizes a raw request body into a TaskInput.
 * The server re-validates independently of the client, per the assignment
 * requirement to never rely solely on client-side validation.
 */
function parseTaskInput(body: unknown): TaskInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const { title, description, priority, dueDate, status } = body as Record<string, unknown>;

  if (typeof title !== "string" || title.trim().length === 0) {
    throw new ValidationError("Title is required.");
  }

  if (description !== undefined && typeof description !== "string") {
    throw new ValidationError("Description must be a string.");
  }

  if (typeof priority !== "string" || !PRIORITIES.includes(priority as TaskPriority)) {
    throw new ValidationError(`Priority must be one of: ${PRIORITIES.join(", ")}.`);
  }

  if (typeof dueDate !== "string" || !DATE_PATTERN.test(dueDate) || Number.isNaN(Date.parse(dueDate))) {
    throw new ValidationError("Due date is required and must be a valid date (yyyy-MM-dd).");
  }

  if (typeof status !== "string" || !STATUSES.includes(status as TaskStatus)) {
    throw new ValidationError(`Status must be one of: ${STATUSES.join(", ")}.`);
  }

  return {
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
    priority: priority as TaskPriority,
    dueDate,
    status: status as TaskStatus,
  };
}

function parseTaskId(rawId: string): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("Task id must be a positive integer.");
  }
  return id;
}

export async function getAllTasks(): Promise<Task[]> {
  return readTasks();
}

export async function createTask(body: unknown): Promise<Task> {
  const input = parseTaskInput(body);
  const tasks = await readTasks();

  const nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  const newTask: Task = { id: nextId, ...input };

  tasks.push(newTask);
  await writeTasks(tasks);
  return newTask;
}

export async function updateTask(rawId: string, body: unknown): Promise<Task> {
  const id = parseTaskId(rawId);
  const input = parseTaskInput(body);
  const tasks = await readTasks();

  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new NotFoundError(`Task with id ${id} was not found.`);
  }

  const updatedTask: Task = { id, ...input };
  tasks[index] = updatedTask;
  await writeTasks(tasks);
  return updatedTask;
}

export async function deleteTask(rawId: string): Promise<void> {
  const id = parseTaskId(rawId);
  const tasks = await readTasks();

  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new NotFoundError(`Task with id ${id} was not found.`);
  }

  tasks.splice(index, 1);
  await writeTasks(tasks);
}
