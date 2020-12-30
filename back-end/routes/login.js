const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
//const bcrypt = require('bryptjs');
const db= require('../db.js');

router.use(express.urlencoded({extended: true}));

router.post('/',(req,res)=>{
    console.log(req.body);
    res.send(req.body);
    // var sql="SELECT * FROM users WHERE" + db.connection.escape
    // db.connection.quert("SELECT * FROM users WHERE")
});

module.exports=router;