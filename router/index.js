const express = require('express');
const { getDefaultPage } = require('../controller/indexRouterController');
const router = express.Router();
const api = require('./api');
const user = require('./user');

router.use('/api', api);
router.use('/user',user);

router.get('/', getDefaultPage);


// router.get('/api')


module.exports = router; 