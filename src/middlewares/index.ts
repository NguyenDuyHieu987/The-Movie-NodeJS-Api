import type { Application } from 'express';
import { authenticationHandler } from './authentication.handler';

export default function middleware(app: Application) {
  app.use(authenticationHandler);
}

export * from './authentication.handler';
export * from './error.handler';
