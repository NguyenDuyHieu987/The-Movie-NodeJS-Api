import express from 'express';

import Image from '@/controllers/image.controller';
const router = express.Router();

router.get('/:id', Image.get);

export default router;
