const jwt = require('jsonwebtoken')
const User = require('../model/userSchema');


const requireAuth = async (req, res, next) =>{
  // verify authentication
  const {authorization} = req.headers;
  if(!authorization){
    return res.status(401).json({error: 'Authorization token is required'})
  }
  

  // split the token from the authorization header
  const token = authorization.split(' ')[1];
  //console.log('token: ', token);

  try{
    // verify the jwt token in the authorization header 
    const {_id} = jwt.verify(token, process.env.JWT_SECRET);
    console.log(_id);
    // find if the user with the same id exist in the db
    // only return the id field from the db
    req.user = await User.findOne({_id:_id}).select('_id')
    next();
  }catch(error){
    console.log(error);
    res.status(401).json({error:'Request is not authorized'})
  }

};

module.exports = requireAuth