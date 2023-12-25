import Year from '@/controllers/yearController';
import express from 'express';

const router = express.Router();

router.get('/:slug', Year.get);

export default router;
