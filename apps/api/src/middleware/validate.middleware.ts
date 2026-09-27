import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { ValidationError } from '@utils/AppError';

export const validate =
  (schema: z.ZodTypeAny) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        }));
        return next(new ValidationError('Validation failed', errors));
      }
      next(error);
    }
  };