import express from 'express';

import Account from '@/controllers/account.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.get(
  '/get-all',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Account.getAll
);
router.get(
  '/search',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Account.search
);
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
router.post(
  '/change-avatar',
  (...params) => authenticationHandler(...params, { required: true }),
  Account.changeAvatar
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
router.post(
  '/create',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Account.create
);
router.post(
  '/update/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Account.updateAccount
);
router.delete(
  '/delete/:id',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Account.deleteAccount
);
router.delete(
  '/delete-multiple',
  (...params) =>
    authenticationHandler(...params, { required: true, role: ['admin'] }),
  Account.deleteAccountMultiple
);

export default router;
