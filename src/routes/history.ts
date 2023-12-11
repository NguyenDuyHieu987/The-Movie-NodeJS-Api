import express from 'express';
import History from '@/controllers/historyController';

const router = express.Router();

router.get('/get-all/:slug', History.getAll);
router.get('/search/:slug', History.search);
router.get('/get/:type/:movieId', History.get);
router.post('/add', History.add);
router.delete('/remove', History.remove);
router.delete('/clear', History.clear);

export default router;
