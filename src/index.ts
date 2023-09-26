import 'module-alias/register';
import { addAliases } from 'module-alias';
addAliases({
  '@': `${__dirname}`,
});
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session, { CookieOptions, SessionOptions } from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import multer from 'multer';
import MongoStore from 'connect-mongo';
import route from './routes';
import MongoDB from './config/db';
import RedisCache from './config/redis';

dotenv.config();

const app = express();

const redisCache = new RedisCache();

const cookieConfig: CookieOptions = {
  httpOnly: false,
  maxAge: +process.env.COOKIE_MAX_AGE! * 3600 * 1000,
  // expires: new Date(
  //   Date.now() + +process.env.COOKIE_MAX_AGE! * 3600 * 1000
  // ),
  // signed: true,
  sameSite: 'lax',
  secure: true,
};

const sessionConfig: SessionOptions = {
  secret: process.env.JWT_SIGNATURE_SECRET!,
  name: process.env.APP_NAME!,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:
      process.env.NODE_ENV == 'production'
        ? process.env.MONGODB_URI!
        : 'mongodb://127.0.0.1:27017/Phimhay247_DB',
  }),
  cookie: cookieConfig,
};

if (process.env.NODE_ENV! == 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionConfig.cookie!.httpOnly = false;
  sessionConfig.cookie!.sameSite = 'lax';
  sessionConfig.cookie!.secure = true;
}

redisCache.connect();

process.on('exit', () => {
  redisCache.quit();
});

MongoDB.connect();

app.use(
  cors({
    origin: [
      process.env.NODE_ENV != 'production' && 'http://localhost:3000',
      process.env.NODE_ENV != 'production' && 'http://localhost:8080',
      'https://phimhay247z.org',
      'https://dash.phimhay247z.org',
      'https://dashboard.phimhay247z.org',
      // www
      'https://www.phimhay247z.org',
    ],
    credentials: true,
  })
);
app.use(session(sessionConfig));
app.use(cookieParser());
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
    extended: true,
  })
);
app.use(multer().any());

const server = http.createServer(app);

route(app);

const PORT = 5000;

server.listen(process.env.PORT || PORT, () => {
  console.log(`App is listening on port: ${PORT}`);
});
