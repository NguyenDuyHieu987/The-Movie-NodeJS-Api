import path from 'path';
import express from 'express';
import cors from 'cors';
import route from './routes';
import db from './config/db';

require('dotenv').config();

const app = express();
const PORT = 5000;

// Copnnect to DB
db.connect();

// app.use(express.static(path.join(__dirname, 'public')));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

// npm install cors
app.use(cors());

// Routs init
route(app);

app.listen(process.env.PORT || PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
