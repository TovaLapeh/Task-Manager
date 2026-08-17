import { promises as fs } from "fs";
import path from "path";
import { Task } from "../models/task.model";
import { PersistenceError } from "../models/errors";

// Anchored to the working directory (server/) rather than __dirname, since
// __dirname differs between dev (tsx running src/) and prod (node running
// dist/) — both npm scripts run with the server directory as cwd.
const DATA_FILE = path.join(process.cwd(), "data", "tasks.json");

/**
 * Isolates all file-system access behind a small repository API. Routes/services
 * work with plain Task objects and never touch fs directly, so the persistence
 * mechanism (JSON file, per the assignment) could be swapped later without
 * touching business logic.
 */
async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

export async function readTasks(): Promise<Task[]> {
  await ensureDataFile();

  let raw: string;
  try {
    raw = await fs.readFile(DATA_FILE, "utf-8");
  } catch {
    throw new PersistenceError("Failed to read the tasks data file.");
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new PersistenceError("Tasks data file is corrupted and could not be parsed.");
  }
}

export async function writeTasks(tasks: Task[]): Promise<void> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
  } catch {
    throw new PersistenceError("Failed to save tasks data file.");
  }
}
