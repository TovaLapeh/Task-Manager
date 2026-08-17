import { existsSync } from "fs";
import path from "path";
import cors from "cors";
import express, { Express } from "express";
import { taskRouter } from "./routes/task.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

/** Angular's build output, when the client has been built. */
const CLIENT_BUILD_DIR = path.join(process.cwd(), "..", "client", "dist", "client", "browser");

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use("/tasks", taskRouter);

  // Serving the built client is optional: during local development the Angular
  // dev server owns the UI (and proxies /tasks here), so this directory does
  // not exist and the API stays a pure API. When it does exist — the
  // single-port setup used on StackBlitz — the same process serves both.
  if (existsSync(CLIENT_BUILD_DIR)) {
    app.use(express.static(CLIENT_BUILD_DIR));
    // SPA fallback: any non-API GET returns index.html.
    app.get(/^(?!\/(tasks|health)\b).*/, (_req, res) => {
      res.sendFile(path.join(CLIENT_BUILD_DIR, "index.html"));
    });
  } else {
    // Otherwise explain what this port is, so opening it directly in a browser
    // is not a bare 404.
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
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
