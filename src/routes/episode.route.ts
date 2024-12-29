import express from 'express';

import Episode from '@/controllers/episode.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/list/:movieId/:seasonId', Episode.getList);
router.get('/search/:movieId/:seasonId', Episode.search);
router.get('/latest/:movieId/:seasonId', Episode.getLatest);
router.get('/get/:movieId/:seasonId/:episodeNumber', Episode.get);
router.get('/getbyid/:movieId/:seasonId/:episodeId', Episode.getById);
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Episode.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Episode.updateEpisode
);
router.post(
  '/update-videoupload/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Episode.updateVideoUpload
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Episode.deleteEpisode
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Episode.deleteEpisodeMultiple
);

export default router;
