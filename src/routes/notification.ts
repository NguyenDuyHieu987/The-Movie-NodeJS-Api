import express from 'express';

import Notification from '@/controllers/notificationController';
const router = express.Router();

router.get('/get', Notification.get);

export default router;
