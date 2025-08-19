import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  const response: ApiResponse<null> = {
    success: false,
    error: message,
  };

  res.status(statusCode).json(response);
};

export const createError = (
  statusCode: string | number,
  message: string
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode =
    typeof statusCode === 'string' ? parseInt(statusCode) : statusCode;
  error.isOperational = true;
  return error;
};
