import express from 'express';

import Authentication from '@/controllers/authentication.controller';
import { authenticationHandler } from '@/middlewares';

const router = express.Router();

router.post('/login', Authentication.logIn);
router.post('/login-facebook', Authentication.logInFacebook);
router.post('/login-google', Authentication.logInGoogle);
router.get(
  '/getuser',
  (...params) => authenticationHandler(...params, { required: true }),
  Authentication.getUserByToken
);
router.post('/verify-signup/:type', Authentication.signUpVerify);
router.post('/signup', Authentication.signUp);
router.post('/forgot-password/:type', Authentication.forgotPassword);
router.post(
  '/logout',
  (...params) => authenticationHandler(...params, { required: true }),
  Authentication.logOut
);

export default router;
