import express from 'express';
import yearController from '../controllers/YearController';

const router = express.Router();

// router.get('/:slug', tvController.detail);
router.get('/:slug', yearController.index);

export default router;
