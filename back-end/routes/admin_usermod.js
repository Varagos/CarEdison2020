//Endpoint which modifies user's password or creates a new user if username 
//in req.params doesn't already exist

const express=require('express');
const router=express.Router();
const db=require('../db.js');
const admin_auth=require('../middleware.js').admin_auth;
const  bcrypt=require('bcryptjs');

//This route is accessible only from admins who are logged in
router.use(admin_auth);

router.post('/:username/:password',(req,res)  => {
    var username=req.params.username;
    var password=bcrypt.hashSync(req.params.password,8);
    
   
    var sql="INSERT INTO users (username,password,role) VALUES (";
    sql+=db.connection.escape(username)+",'"+password+"','user')";
    sql+="ON DUPLICATE KEY UPDATE password='"+password+"'";
    
    db.connection.query(sql,(err,result) => {
        if(err){
            console.log(err);
            
            res.status(500).send("Database error");
            return;
        }
    });
    res.sendStatus(200);
});
module.exports=router;