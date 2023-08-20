import express from 'express';
import List from '@/controllers/listController';
const router = express.Router();

router.get('/getlist/:slug', List.get);
router.get('/searchlist/:slug', List.search);
router.get('/getitem/:type/:movieId', List.getItem);
router.post('/add_item', List.addItem);
router.delete('/remove_item', List.removeItem);
router.delete('/removeall_item', List.removeAllItem);

export default router;
