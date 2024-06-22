import type { Application } from 'express';

import {
  authenticationHandler,
  errorHandler,
  proxyHandler
} from '@/middlewares';

export default function middleware(app: Application, callback: () => void) {
  app.use(proxyHandler);
  app.use(authenticationHandler);
  callback();
  app.use(errorHandler);
}

export * from './proxy.handler';
export * from './authentication.handler';
export * from './error.handler';
