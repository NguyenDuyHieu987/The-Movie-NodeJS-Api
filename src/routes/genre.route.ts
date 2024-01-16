import express from 'express';

import Genre from '@/controllers/genre.controller';
const router = express.Router();

router.get('/get-all', Genre.getAll);

export default router;
