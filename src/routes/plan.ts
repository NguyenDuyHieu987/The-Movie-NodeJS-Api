import express from 'express';
import Plan from '@/controllers/planController';
const router = express.Router();

router.get('/get', Plan.get);

export default router;
