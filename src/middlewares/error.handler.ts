import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response
} from 'express';
import { isHttpError } from 'http-errors';

const errorHandler: ErrorRequestHandler = (
  error: any | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error?.status || error?.statusCode || 500;
  let errorMessage =
    error?.message || error?.body?.message || 'An unknown error occurred';

  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }

  return res.status(statusCode).json({
    status: statusCode,
    message: errorMessage
  });
};

export { errorHandler };
