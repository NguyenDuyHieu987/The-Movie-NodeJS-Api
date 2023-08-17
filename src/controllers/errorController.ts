import type {
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from 'express';
import { isHttpError } from 'http-errors';

const ErrorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error?.status || 500;
  let errorMessage = error?.message || 'An unknown error occurred';

  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }

  res.status(statusCode).json({
    status: statusCode,
    message: errorMessage,
  });
};

export default ErrorHandler;