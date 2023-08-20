import express from 'express';
import Authentication from '@/controllers/authController';

const router = express.Router();

router.post('/login', Authentication.logIn);
router.post('/loginfacebook', Authentication.logInFacebook);
router.post('/logingoogle', Authentication.logInGoogle);
router.get('/getusertoken', Authentication.getUserByToken);
router.post('/verify-signup/:type', Authentication.signUpVerify);
router.post('/signup', Authentication.signUp);
router.post('/forgot-password/:type', Authentication.forgotPassword);
router.post('/logout', Authentication.logOut);

export default router;
