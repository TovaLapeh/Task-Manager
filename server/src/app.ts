import cors from "cors";
import express, { Express } from "express";
import { taskRouter } from "./routes/task.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use("/tasks", taskRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
