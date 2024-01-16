import express from 'express';

import Notification from '@/controllers/notification.controller';
const router = express.Router();

router.get('/get-all', Notification.getAll);

export default router;
