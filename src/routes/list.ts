import express from 'express';
import List from '@/controllers/listController';
const router = express.Router();

router.get('/get-all/:slug', List.getAll);
router.get('/search/:slug', List.search);
router.get('/get/:type/:movieId', List.get);
router.post('/add', List.add);
router.delete('/remove', List.remove);
router.delete('/clear', List.clear);

export default router;
