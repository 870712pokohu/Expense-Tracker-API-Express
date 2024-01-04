const express = require('express');
const { createLinkToken, exchangeToken, getAccountInformation, getAccountBalance } = require('../controller/plaidAPIController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.get('/',(req,res)=>{
  res.json('this is api');
}); 

// validate user login status
router.use(requireAuth);

// create link token
router.post('/create_link_token', createLinkToken);

// get access token from the client side
router.post('/set_access_token',exchangeToken)

// get account information
router.post('/accounts/balance',getAccountBalance)

// get sync transaction information
router.get('/transactions/sync')

router.post('/accounts/info',getAccountInformation)

module.exports = router;