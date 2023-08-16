import express from 'express';
import authController from '../controllers/AuthController';

const router = express.Router();

router.post('/signin', authController.signin);
router.post('/signup', authController.signup);
router.post('/getusertoken', authController.getUserByUserToken);

export default router;
