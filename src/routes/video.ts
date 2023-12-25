import Video from '@/controllers/videoController';
import express from 'express';
const router = express.Router();

router.get('/:id', Video.get);

export default router;
