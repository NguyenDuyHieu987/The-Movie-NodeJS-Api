import express from 'express';

import Genre from '@/controllers/genre.controller';
const router = express.Router();

router.get('/get-all', Genre.getAll);
router.get('/search/:movieId/:seasonId', Genre.search);
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Genre.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Genre.updateGenre
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Genre.deleteGenre
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Genre.deleteGenreMultiple
);

export default router;
