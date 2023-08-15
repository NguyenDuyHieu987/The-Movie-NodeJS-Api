const express = require('express');
const router = express.Router();

const authController = require('../app/controllers/AuthController');

router.post('/signin', authController.signin);
router.post('/signup', authController.signup);
router.post('/getusertoken', authController.getUserByUserToken);

module.exports = router;
