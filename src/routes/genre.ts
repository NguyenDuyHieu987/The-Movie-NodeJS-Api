import Genre from '@/controllers/genreController';
import express from 'express';
const router = express.Router();

router.get('/:slug', Genre.get);

export default router;
