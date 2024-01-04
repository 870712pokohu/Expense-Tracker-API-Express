const express = require('express');
const { registerNewUser, validateUser } = require('../controller/userController');
const router = express.Router();

router.post('/register', registerNewUser);

router.post('/login',validateUser);

module.exports = router; 