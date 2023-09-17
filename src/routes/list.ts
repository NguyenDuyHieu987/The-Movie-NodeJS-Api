import express from 'express';
import List from '@/controllers/listController';
const router = express.Router();

router.get('/get/:slug', List.get);
router.get('/search/:slug', List.search);
router.get('/getitem/:type/:movieId', List.getItem);
router.post('/additem', List.addItem);
router.delete('/removeitem', List.removeItem);
router.delete('/removeallitem', List.removeAllItem);

export default router;
