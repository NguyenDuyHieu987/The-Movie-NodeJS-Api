import express from 'express';
import Authentication from '@/controllers/authController';

const router = express.Router();

router.post('/login', Authentication.login);
router.post('/signup', Authentication.signup);
router.post('/getusertoken', Authentication.getUserByUserToken);

export default router;
