import express from 'express';
import listController from '../controllers/listController';
const router = express.Router();

// router.get('/:slug', tvController.detail);
router.get('/:slug', listController.get);
router.post('/:slug/add_item', listController.addItem);
router.post('/:slug/remove_item', listController.removeItem);

export default router;
