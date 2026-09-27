import { Request, Response, NextFunction } from 'express';
import { logger } from '@config/logger';
import { env } from '@config/env';
import multer from 'multer';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 400;
      message = 'File too large (max 10 MB)';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      statusCode = 400;
      message = 'Too many files (max 10)';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      statusCode = 400;
      message = `Unexpected field: ${err.field}`;
    } else {
      statusCode = 400;
    }
  }

  if (!err.isOperational) {
    logger.error({ err, url: req.originalUrl, method: req.method }, 'Unexpected error');
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.isDev && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
};