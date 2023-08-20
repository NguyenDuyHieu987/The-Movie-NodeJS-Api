import express from 'express';
import Video from '@/controllers/videoController';
const router = express.Router();

router.get('/:id', Video.get);

export default router;
