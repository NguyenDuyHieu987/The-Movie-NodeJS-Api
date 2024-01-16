import type { Application } from 'express';
import { authenticationHandler } from './authentication.handler';
import { errorHandler } from './error.handler';

export default function middleware(app: Application) {
  app.use(authenticationHandler);
  app.use(errorHandler);
}

export * from './authentication.handler';
export * from './error.handler';
