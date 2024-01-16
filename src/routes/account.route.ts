import express from 'express';

import Account from '@/controllers/account.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.post(
  '/confirm/:type',
  (...params) => authenticationHandler(...params, { required: true }),
  Account.confirm
);
router.post(
  '/change-password',
  (...params) => authenticationHandler(...params, { required: true }),
  Account.changePassword
);
router.post(
  '/change-fullname',
  (...params) => authenticationHandler(...params, { required: true }),
  Account.changeFullName
);
router.get(
  '/change-email',
  (...params) => authenticationHandler(...params, { required: true }),
  Account.changeEmailRetrieveToken
);
router.post(
  '/change-email',
  (...params) => authenticationHandler(...params, { required: true }),
  Account.changeEmail
);
router.post(
  '/verify-email',
  (...params) => authenticationHandler(...params, { required: true }),
  Account.verifyEmail
);
router.get('/reset-password', Account.resetPasswordRetrieveToken);
router.post('/reset-password', Account.resetPassword);

export default router;
