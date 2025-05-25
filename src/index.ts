import 'module-alias/register';
import { addAliases } from 'module-alias';
addAliases({
  '@': `${__dirname}`
});
import bodyParser from 'body-parser';
import compression from 'compression';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session, { CookieOptions, SessionOptions } from 'express-session';
import { rateLimit } from 'express-rate-limit';
import http from 'http';
import multer from 'multer';
import MongoDB from './config/db';
import RedisCache from './config/redis';
import route from './routes';
import middleware from './middlewares';
import SocketService from './config/websocket';
import { APP_TOKEN_SECRET } from './constants';
import { ONE_HOUR } from './common';
import path from 'path';
import favicon from 'serve-favicon';

dotenv.config();

const app = express();

const cookieConfig: CookieOptions = {
  httpOnly: true,
  // maxAge: +process.env.COOKIE_MAX_AGE! * ONE_HOUR * 1000,
  domain:
    process.env.NODE_ENV == 'production'
      ? '.' + process.env.CLIENT_DOMAIN
      : 'localhost',
  // expires: new Date(
  //   Date.now() + +process.env.COOKIE_MAX_AGE! * ONE_HOUR * 1000
  // ),
  // signed: true,
  sameSite: 'lax',
  secure: true,
  priority: 'high'
};

const sessionConfig: SessionOptions = {
  secret: APP_TOKEN_SECRET,
  // name: process.env.APP_NAME!,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:
      process.env.NODE_ENV == 'production'
        ? process.env.MONGODB_URI!
        : process.env.MONGODB_URI_DEV!,
    dbName: 'Phimhay247_DB_NEW_V2',
    collectionName: 'sessions'
  }),
  cookie: cookieConfig
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1000,
  message: {
    status: 429,
    message:
      'You have exceeded the limit of requests per minute. Please try again later.'
  },
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
  // store: ... , // Use an external store for consistency across multiple server instances.
});

if (process.env.NODE_ENV! == 'production') {
  // trust first proxy
  app.set('trust proxy', 1);
  sessionConfig.cookie!.httpOnly = false;
  sessionConfig.cookie!.sameSite = 'lax';
  sessionConfig.cookie!.secure = true;
}

RedisCache.connect();

process.on('exit', () => {
  RedisCache.quit();
});

MongoDB.connect();

app.use(
  cors({
    origin: [
      process.env.NODE_ENV != 'production' && process.env.CLIENT_DEV_URL!,
      process.env.NODE_ENV != 'production' && 'http://localhost:5173',
      'https://' + process.env.CLIENT_DOMAIN,
      'https://proxy.' + process.env.CLIENT_DOMAIN,
      'https://dash.' + process.env.CLIENT_DOMAIN,
      'https://dashboard.' + process.env.CLIENT_DOMAIN,
      'https://vite.' + process.env.CLIENT_DOMAIN,
      'https://v2.' + process.env.CLIENT_DOMAIN,
      // www
      'https://www.' + process.env.CLIENT_DOMAIN
    ],
    credentials: true
  })
);
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(session(sessionConfig));
app.use(cookieParser());
app.use(limiter);
app.use(bodyParser.json());
app.use(compression());
// app.use(express.json());
// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(multer().any());

middleware(app, () => {
  route(app);
});

const server = http.createServer(app);

SocketService.initialize(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`App is listening on port: ${PORT}`);
});
