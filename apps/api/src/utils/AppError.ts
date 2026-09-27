export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(msg = 'Bad Request') { super(msg, 400); }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') { super(msg, 401); }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') { super(msg, 403); }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Not Found') { super(msg, 404); }
}
export class ConflictError extends AppError {
  constructor(msg = 'Conflict') { super(msg, 409); }
}
export class ValidationError extends AppError {
  constructor(msg = 'Validation Failed', errors?: unknown) {
    super(msg, 422, errors);
  }
}
export class InternalServerError extends AppError {
  constructor(msg = 'Internal Server Error') { super(msg, 500); }
}