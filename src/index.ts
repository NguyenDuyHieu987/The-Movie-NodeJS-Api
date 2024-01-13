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
import http from 'http';
import multer from 'multer';
import MongoDB from './config/db';
import RedisCache from './config/redis';
import route from './routes';

dotenv.config();

const app = express();

const redisCache = new RedisCache();

const cookieConfig: CookieOptions = {
  httpOnly: false,
  maxAge: +process.env.COOKIE_MAX_AGE! * 3600 * 1000,
  domain: '.' + process.env.CLIENT_DOMAIN,
  // expires: new Date(
  //   Date.now() + +process.env.COOKIE_MAX_AGE! * 3600 * 1000
  // ),
  // signed: true,
  sameSite: 'lax',
  secure: true
};

const sessionConfig: SessionOptions = {
  secret: process.env.JWT_SIGNATURE_SECRET!,
  // name: process.env.APP_NAME!,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl:
      process.env.NODE_ENV == 'production'
        ? process.env.MONGODB_URI!
        : 'mongodb://127.0.0.1:27017/Phimhay247_DB'
  }),
  cookie: cookieConfig
};

if (process.env.NODE_ENV! == 'production') {
  // trust first proxy
  app.set('trust proxy', 1);
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
      process.env.NODE_ENV != 'production' && process.env.CLIENT_DEV_URL!,
      process.env.NODE_ENV != 'production' && 'http://localhost:8080',
      'https://' + process.env.CLIENT_DOMAIN,
      'https://static.' + process.env.CLIENT_DOMAIN,
      'https://dash.' + process.env.CLIENT_DOMAIN,
      'https://dashboard.' + process.env.CLIENT_DOMAIN,
      // www
      'https://www.' + process.env.CLIENT_DOMAIN
    ],
    credentials: true
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
    extended: true
  })
);
app.use(multer().any());

const server = http.createServer(app);

route(app);

const PORT = 5000;

server.listen(process.env.PORT || PORT, () => {
  console.log(`App is listening on port: ${PORT}`);
});
