import express from 'express';
import Image from '@/controllers/imageController';
const router = express.Router();

router.get('/:id', Image.get);

export default router;
