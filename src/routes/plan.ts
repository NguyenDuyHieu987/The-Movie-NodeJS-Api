import express from 'express';
import Plan from '@/controllers/planController';
const router = express.Router();

router.get('/get', Plan.get);
router.post('/register/:id', Plan.register);
router.get('/register/retrieve/:id', Plan.retrieve);

export default router;
