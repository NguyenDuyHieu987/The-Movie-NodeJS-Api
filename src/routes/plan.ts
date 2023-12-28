import express from 'express';

import Plan from '@/controllers/planController';
const router = express.Router();

router.get('/get-all', Plan.getAll);
router.post('/register/:id', Plan.register);
router.get('/:method/retrieve/:id', Plan.retrieve);

export default router;
