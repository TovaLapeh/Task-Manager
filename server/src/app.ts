import cors from "cors";
import express, { Express } from "express";
import { taskRouter } from "./routes/task.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  // Landing page for anyone who opens the API port directly in a browser.
  // Sandboxed hosts such as StackBlitz preview whichever port opens first,
  // which is this one, so a bare 404 there is confusing.
  app.get("/", (_req, res) => {
    res
      .status(200)
      .type("html")
      .send(
        `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Task Manager API</title></head>
  <body style="font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.6">
    <h1>Task Manager API</h1>
    <p>This is the REST API. The user interface runs on <strong>port 4200</strong>.</p>
    <p>Endpoints: <code>GET /tasks</code>, <code>POST /tasks</code>,
       <code>PUT /tasks/:id</code>, <code>DELETE /tasks/:id</code>.</p>
  </body>
</html>`,
      );
  });

  app.use("/tasks", taskRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
