import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, message: err.message });
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    logger.warn(err.errors);
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({ path: e.path, message: e.message })),
    });
  }

  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
