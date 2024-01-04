require('dotenv').config()
const mongoose = require('mongoose');
const User = require('../model/userSchema');
const { Configuration, PlaidApi, Products, PlaidEnvironments, AccountSubtype, TransferType } = require('plaid');
const environment = process.env.PLAID_ENV; 
const country_codes = process.env.PLAID_COUNTRY_CODES;
const products = process.env.PLAID_PRODUCTS;
const language = process.env.PLAID_LANGUAGE;
const client_name = 'SmartWallet'; 
const client_user_id = process.env.PLAID_CLIENT_ID;
const client_secret = process.env.PLAID_SECRET; 
const redirect_url = process.env.PLAID_REDIRECT_URI;
const link_customization_name = process.env.PLAID_LINK_CUSTOMIZATION;

// initialize the Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[environment],
  baseOptions:{
    headers:{
      'PLAID-CLIENT-ID': client_user_id,
      'PLAID-SECRET': client_secret,
      'Plaid-Version': '2020-09-14'
    }
  }
})

const configs = {
  user: {
    client_user_id: client_user_id,
  },
  client_name: client_name,
  products: ['auth', 'transactions'],
  country_codes: ['CA'],
  language: language,
  redirect_url: redirect_url,
  link_customization_name: link_customization_name,
};

const getAccessToken = async(email) =>{
  try{
    const user = await User.findOne({email: email});
    // generate access token if the user has found
    if(user){
      const accessToken = user.accessToken;
      console.log('get access token', accessToken);
      return accessToken;
    }else{
      return null; 
    }
  }catch(error){
    console.error(error);
    return null;
  }
};

const client = new PlaidApi(configuration);

// create a link token for the client 
const createLinkToken = async (req, res) =>{
  const email = req.body.email; 

  try{
    const response = await client.linkTokenCreate(configs);
    const linkToken = response.data.link_token;
    console.log('linktoken:', linkToken);
    res.json(linkToken);

  }catch (error){
    console.error(error);
    
  }

};

// get public token from the client side to exchange for access token
const exchangeToken = async(req, res) =>{
  const email = req.body.email; 
  const public_token = req.body.public_token;
  const response = await client.itemPublicTokenExchange({
    public_token: public_token,
  });
  const accessToken = response.data.access_token;
  // store the accessToken in the environment variable
  if(accessToken!=null){
    process.env.ACCESS_TOKEN = accessToken; 
    // return the document after update was applied.
    const respond = await User.findOneAndUpdate({
      email: email
    },{
      accessToken:accessToken 
    },{new: true});
    console.log('respond: ', respond);
    res.status(200).json(respond);
  }
  const itemId = response.data.item_id;
  //console.log('accessToken:', process.env.ACCESS_TOKEN);
  //console.log('itemID:', itemId);
};

const getAccountBalance = async (access_token) =>{
  const response = await client.accountsBalanceGet({
    access_token: access_token,
  })
  const accounts = response.data.accounts;
  return {accounts}
};

const getTransactionInfo = async (access_token) =>{
  // when working with an array of data make sure to initialize the variable with the Array constructor or an array literal notation ([])
  let addedTransactions = [];
  let modifiedTransactions = [];
  let removedTransactions = []; 
  let hasMore = true;
  let cursor; 
  // iterate through each page of transaction updates for item
  while(hasMore){
    const response = await client.transactionsSync({
      access_token: access_token,
      cursor: cursor
    });
    const data = response.data; 
    if(data){
      // push transaction info into lists
      addedTransactions.push(data.added);
      modifiedTransactions.push(data.modified);
      removedTransactions.push(data.removed)
    }
    // check if this is the final transaction info
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }
  // return three transaction array to the calling function
  return {addedTransactions, modifiedTransactions, removedTransactions}
};


const getAccountInformation = async (req, res) =>{
  const email = req.body.email; 
  const access_token = await getAccessToken(email);
  try{
    // get account balance
    const { accounts } = await getAccountBalance(access_token);
    // get account transactions' records 
    const { addedTransactions, modifiedTransactions, removedTransactions } = await getTransactionInfo(access_token);
    const transaction = addedTransactions[0].concat(addedTransactions[1]);
    res.status(200).json({accountInfo: accounts, transaction: transaction})
  } catch (error) {
    console.log('get account info:',error.response.data.error_code)
    const errorCode = error.response.data.error_code
    // initiate an update mode for the user
    if(errorCode === "ITEM_LOGIN_REQUIRED"){
      
    }
    res.status(400).json({error: error.message})
  }

};



module.exports = {
  createLinkToken,
  exchangeToken,
  getAccountBalance,
  getAccountInformation
}