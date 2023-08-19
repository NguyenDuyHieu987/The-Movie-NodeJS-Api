import express from 'express';
import Genre from '@/controllers/genreController';
const router = express.Router();

router.get('/:slug', Genre.get);

export default router;
