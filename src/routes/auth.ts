import express from 'express';
import Authentication from '@/controllers/authController';

const router = express.Router();

router.post('/login', Authentication.login);
router.post('/loginfacebook', Authentication.loginFacebook);
router.post('/logingoogle', Authentication.loginGoogle);
router.post('/getusertoken', Authentication.getUserByToken);
router.post('/verify-signup/:type', Authentication.signup_verify);
router.post('/signup', Authentication.signup);

export default router;
