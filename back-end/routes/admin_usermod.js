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
    
   
    var sql="SELECT * FROM users WHERE username=";
    sql+=db.connection.escape(username);
    
    db.connection.query(sql,(err,result) => {
        if(err){
            console.log(err);
            
            res.status(500).send("Database error");
            return;
        }
        if(result.length){
            //If user exists change his password
            sql="UPDATE users SET password=";
            sql+=db.connection.escape(password)
            sql+=" WHERE username="+db.connection.escape(username);
            
        }
        else{
            //Else create a new user with user role
            sql="INSERT INTO users (username,password,role) VALUES (";
            sql+=db.connection.escape(username)+",";
            sql+=db.connection.escape(password)+",'user')";
        }
        db.connection.query(sql,(err,result) => {
            if(err){
                console.log(err);
                
                res.status(500).send("Database error");
                return;
            }
        });
    });
    res.sendStatus(200);
});
module.exports=router;