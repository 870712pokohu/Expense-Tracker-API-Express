const mongoose = require('mongoose');
const User = require('../model/userSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const privateKey = process.env.JWT_SECRET;

// create jwt token
const createToken = (_id) =>{
  return jwt.sign({ _id: _id }, privateKey ,{ expiresIn: '3d' } )
};

const registerNewUser = async(req, res) =>{
  const {name, email, password} = req.body
  try{
    const user = await User.signup(name, email, password);
    // create jwt token for new created user
    const token = createToken(user._id);
    res.status(200).json({email, token});
  }catch(error){
    res.status(400).json({error: error.message});
  }
};

const validateUser = async (req, res) =>{
  const {userName, password} = req.body;
  console.log(userName);
  console.log(password)
  try{
    const user = await User.login(userName, password);
    const token = createToken(user._id);
    res.status(200).json({
     email: user.email,
     name: user.name,
     accessToken: user.accessToken,
     token: token
    })
  }catch(error){
    console.log(error)
    res.status(400).json({error: error.message});
  }
};


module.exports = {
  registerNewUser,
  validateUser
}