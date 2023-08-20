import express from 'express';
import Account from '@/controllers/accountController';
const router = express.Router();

router.post('/change-password', Account.changePassword);
router.post('/change-email', Account.changeEmail);
router.post('/verify/:type', Account.verify);

export default router;
