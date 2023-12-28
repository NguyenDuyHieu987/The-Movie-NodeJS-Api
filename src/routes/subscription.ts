import express from 'express';

import Subscription from '@/controllers/subscriptionController';
const router = express.Router();

router.get('/get', Subscription.get);

export default router;
