import 'module-alias/register';
import { addAliases } from 'module-alias';
addAliases({
  '@': `${__dirname}`,
});
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import multer from 'multer';
import route from './routes';
import MongoDB from './config/db';
import RedisCache from './config/redis';

const redisCache = new RedisCache();

dotenv.config();

redisCache.connect();

process.on('exit', () => {
  redisCache.quit();
});

MongoDB.connect();

const app = express();

app.use(cors());
app.use(compression());
// app.use(express.json());
// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );
app.use(bodyParser.json());
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
  console.log(`App listening on port: ${PORT}`);
});
