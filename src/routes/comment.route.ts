import express from 'express';

import Comment from '@/controllers/comment.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get('/get-all/:movieType/:movieId', Comment.getParent);
router.get('/get/:movieType/:movieId/:parentId', Comment.getChild);
router.post(
  '/post/:movieType/:movieId',
  (...params) => authenticationHandler(...params, { required: true }),
  Comment.post
);
router.put(
  '/edit/:movieType/:movieId',
  (...params) => authenticationHandler(...params, { required: true }),
  Comment.edit
);
router.delete(
  '/delete/:movieType/:movieId',
  (...params) => authenticationHandler(...params, { required: true }),
  Comment.delete
);
router.post(
  '/like/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Comment.like
);
router.post(
  '/dislike/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Comment.dislike
);
router.get(
  '/check-like-dislike/:id',
  (...params) => authenticationHandler(...params, { required: true }),
  Comment.checkLikeDislike
);

export default router;
