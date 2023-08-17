// import 'module-alias/register';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import route from './routes';
import db from './config/db';

dotenv.config();

const app = express();

db.connect();

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
const server = http.createServer(app);

route(app);

const PORT = 5000;

server.listen(process.env.PORT || PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
