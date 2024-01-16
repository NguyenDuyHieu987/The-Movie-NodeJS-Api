import express from 'express';

import Subscription from '@/controllers/subscription.controller';
const router = express.Router();

router.get('/get', Subscription.get);

export default router;
