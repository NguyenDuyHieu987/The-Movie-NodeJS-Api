import Authentication from '@/controllers/authController';
import express from 'express';

const router = express.Router();

router.post('/login', Authentication.logIn);
router.post('/login-facebook', Authentication.logInFacebook);
router.post('/login-google', Authentication.logInGoogle);
router.get('/getuser', Authentication.getUserByToken);
router.post('/verify-signup/:type', Authentication.signUpVerify);
router.post('/signup', Authentication.signUp);
router.post('/forgot-password/:type', Authentication.forgotPassword);
router.post('/logout', Authentication.logOut);

export default router;
