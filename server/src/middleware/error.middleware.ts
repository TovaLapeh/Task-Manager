import { NextFunction, Request, Response } from "express";
import { AppError } from "../models/errors";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `Route ${req.method} ${req.path} does not exist.` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // express.json() throws a SyntaxError for malformed JSON bodies before
  // our validation ever runs; surface it as a 400 instead of a 500.
  if (err instanceof SyntaxError && "status" in err && (err as { status?: number }).status === 400) {
    res.status(400).json({ message: "Request body contains malformed JSON." });
    return;
  }

  // Unexpected errors are logged server-side but never leak internal
  // details (stack traces, file paths) to the client.
  console.error(err);
  res.status(500).json({ message: "An unexpected server error occurred." });
}
