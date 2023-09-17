import express from 'express';
import History from '@/controllers/historyController';

const router = express.Router();

router.get('/get/:slug', History.get);
router.get('/search/:slug', History.search);
router.get('/getitem/:type/:movieId', History.getItem);
router.post('/additem', History.addItem);
router.delete('/removeitem', History.removeItem);
router.delete('/removeallitem', History.removeAllItem);

export default router;
