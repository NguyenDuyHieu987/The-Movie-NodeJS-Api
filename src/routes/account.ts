import express from 'express';
import Account from '@/controllers/accountController';
const router = express.Router();

router.post('/confirm/:type', Account.confirm);
router.post('/change-password', Account.changePassword);
router.post('/change-email', Account.changeEmail);
router.post('/verify-email', Account.verifyEmail);

export default router;
