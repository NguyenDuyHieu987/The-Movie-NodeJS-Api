import Plan from '@/controllers/planController';
import express from 'express';
const router = express.Router();

router.get('/get', Plan.get);
router.post('/register/:id', Plan.register);
router.get('/:method/retrieve/:id', Plan.retrieve);

export default router;
