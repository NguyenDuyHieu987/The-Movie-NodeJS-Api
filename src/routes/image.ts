import Image from '@/controllers/imageController';
import express from 'express';
const router = express.Router();

router.get('/:id', Image.get);

export default router;
