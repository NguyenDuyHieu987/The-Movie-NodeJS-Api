import Notification from '@/controllers/notificationController';
import express from 'express';
const router = express.Router();

router.get('/get', Notification.get);

export default router;
