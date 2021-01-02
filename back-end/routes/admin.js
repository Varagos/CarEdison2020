const express=require('express');
const router=express.Router();
const db=require('../db.js');
const admin_auth=require('../middleware.js').admin_auth;

router.use(admin_auth);

router.post('/usermod/:username/:password',(req,res)  => {
    var username=req.params.username;
    var password=req.params.password;
    
    var sql="SELECT * FROM users WHERE username=";
    sql+=db.connection.escape(username);
    
    db.connection.query(sql,(err,result) => {
        if(err){
            console.log(err);
            
            res.status(500).send("Database error");
            return;
        }
        if(result.length){
            console.log("OK",result);
            res.sendStatus(200);
            return;
        }
        else{
            sql="INSERT INTO users VALUES (";
            sql+=db.connection.escape(username)+",";
            sql+=db.connection.escape(password)+",'user')";
            db.connection.query(sql,(error,val)=>{
                if(error){
                    console.log(error);
                    res.send(500).send("Database error");
                    return;
                }
            });
            res.sendStatus(200);

        }
    });

});
module.exports=router;