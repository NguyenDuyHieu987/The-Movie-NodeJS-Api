import express from 'express';
import genreController from '../controllers/GenreController';
const router = express.Router();

// router.get('/:slug', tvController.detail);
router.get('/:slug', genreController.index);

export default router;
