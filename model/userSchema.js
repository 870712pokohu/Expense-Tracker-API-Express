const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator')
const saltRounds = 10; 
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
  type: String,
  required: true
  },
  accessToken:{
    type: String,
    default: false
  }
});

// when using the static method in mongoose we should not use ES6 arrow function
userSchema.statics.signup = async function (name, email, password) {
    // new hashed password
    const hashPassword = await bcrypt.hash(password,saltRounds);
  
    // check if the email is already existed in the db 
    const find = await this.findOne({email:email});
    if(find){
      // throw an exception when the email has found
      throw new Error('The email has already been created')
    }else{
      const createUser = await this.create({
        name: name,
        email: email,
        password: hashPassword
      }); 
      return createUser
    }
};

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({
    email: email
  });
  if (!user) {
    throw new Error('Incorrect username or password')
  }
  else{
    const checkPassword = await bcrypt.compare(password, user.password);
    if(!checkPassword){
      throw new Error('Incorrect username or password')
    }
    return user
  }
};


const User = mongoose.model('user',userSchema);

module.exports = User