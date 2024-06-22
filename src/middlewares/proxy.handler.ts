import type { NextFunction, Request, Response } from 'express';

const proxyHandler = (req: Request, res: Response, next: NextFunction) => {
  const proxyAuthHeader = req.headers['x-proxy-auth'];
  const apiKey = req.headers['x-api-key'];
  const requestIP = req.ip || req.connection.remoteAddress;
  console.log(requestIP);

  if (
    proxyAuthHeader !== 'my-proxy-key'
    // apiKey !== validApiKey ||
    // requestIP !== allowedProxyIP
    // process.env.NODE_ENV == 'production'
  ) {
    return res.status(403).send('Forbidden: Access is denined.');
  }

  next();
};

export { proxyHandler };
