import express from 'express';

import Account from '@/controllers/accountController';
const router = express.Router();

router.post('/confirm/:type', Account.confirm);
router.post('/change-password', Account.changePassword);
router.post('/change-fullname', Account.changeFullName);
router.get('/change-email', Account.changeEmailRetrieveToken);
router.post('/change-email', Account.changeEmail);
router.post('/verify-email', Account.verifyEmail);
router.get('/reset-password', Account.resetPasswordRetrieveToken);
router.post('/reset-password', Account.resetPassword);

export default router;
