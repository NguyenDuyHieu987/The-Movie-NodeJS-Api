import express from 'express';
import Authentication from '@/controllers/authController';

const router = express.Router();

router.post('/login', Authentication.login);
router.post('/loginfacebook', Authentication.loginFacebook);
router.post('/logingoogle', Authentication.loginGoogle);
router.post('/signup', Authentication.signup);
router.post('/getusertoken', Authentication.getUserByToken);

export default router;
