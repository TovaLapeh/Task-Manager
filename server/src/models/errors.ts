/**
 * Typed error hierarchy so the error middleware can map failures to the
 * correct HTTP status without inspecting error messages.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class PersistenceError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}
