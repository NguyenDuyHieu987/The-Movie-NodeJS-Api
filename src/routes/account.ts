import express from 'express';
import Account from '@/controllers/accountController';
const router = express.Router();

router.post('/change-password', Account.changePassword);
router.post('/change-email', Account.changeEmail);
router.post('/verify-email', Account.verifyEmail);
router.post('/confirm/:type', Account.confirm);

export default router;
