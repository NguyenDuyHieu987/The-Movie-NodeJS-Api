import type { Application } from 'express';

import { authenticationHandler, errorHandler } from '@/middlewares';

export default function middleware(app: Application, callback: () => void) {
  app.use(authenticationHandler);
  callback();
  app.use(errorHandler);
}

export * from './authentication.handler';
export * from './error.handler';
