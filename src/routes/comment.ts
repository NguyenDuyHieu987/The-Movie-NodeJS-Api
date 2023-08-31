import express from 'express';
import Comment from '@/controllers/commentController';
const router = express.Router();

router.get('/get-all/:movieType/:movieId', Comment.getParent);
router.get('/get/:movieType/:movieId/:parentId', Comment.getChild);
router.post('/post/:movieType/:movieId', Comment.post);
router.put('/edit/:movieType/:movieId', Comment.edit);
router.delete('/delete/:movieType/:movieId', Comment.delete);
router.post('/like/:id', Comment.like);
router.post('/dislike/:id', Comment.dislike);

export default router;
