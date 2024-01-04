const express = require('express');
const router = require('./router');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');

let port;
let mongodbURI;

require('dotenv').config();
if(process.env.NODE_ENV === 'development'){
  port = process.env.PORT; 
  mongodbURI = process.env.MONGODB_URI;
}

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(router);

const dbConnection = async () =>{
  try{
    await mongoose.connect(mongodbURI)
      .catch((error)=>{
        console.log(error);
      })

  }catch(error){
    console.error(error)
  }
  
}

if(dbConnection()){
  app.listen(port,()=>{
    console.log('the backend server is running at port:', port);
  })
}else{
  console.log('failed to connect database');
}