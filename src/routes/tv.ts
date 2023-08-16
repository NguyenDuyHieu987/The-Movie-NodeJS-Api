import express from 'express';
import tvController from '../controllers/TVController';
const router = express.Router();

// router.get('/:slug', tvController.detail);
router.get('/:slug', tvController.index);
router.get('/:movieid/season/:seasonnumber', tvController.season);
router.post('/:movieid/:slug1', tvController.update);

export default router;
