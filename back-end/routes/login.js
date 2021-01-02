const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db= require('../db.js');
const config=require('../config.js');

//decode parameters
router.use(express.urlencoded({extended: true}));

router.post('/',(req,res)=>{
    var username=req.body.username;
    var password=req.body.password;

    if(!username || !password){
        res.status(400).send("Username and password are required");
        return;
    }
    var sql="SELECT username,password,role FROM users WHERE username=" + db.connection.escape(username);
    db.connection.query(sql,(err,result) => {
        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        }
        if(result.length){
            //check for correct password
            if(bcrypt.compareSync(password,result[0].password)){
                //create token
                var token=jwt.sign({
                    username:username,
                    role:result[0].role},config.secret,{
                        expiresIn:86400 //validate token for 24 hours
                    });
                sql="UPDATE users SET token="+db.connection.escape(token);
                sql+=" WHERE username="+db.connection.escape(username);
                db.connection.query(sql,(err,result) => {
                    if(err){
                        console.log(err);
                        res.status(500).send("Database error");
                        return;
                    }

                });
                 res.status(200).send({token: token});
                return;
            }
            else{
                res.status(401).send("Incorrect password");
                return;
            }

        }
        else{
            res.status(402).send("This username does not exist");
            return;
        }
    });
});

module.exports=router;