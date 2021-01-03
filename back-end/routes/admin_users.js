const express=require('express');
const router=express.Router();
const db=require('../db.js');
const admin_auth=require('../middleware.js').admin_auth;

router.use(admin_auth);

router.get('/:username',(req,res) => {
    var username=req.params.username;

    var sql="SELECT * FROM users WHERE username=";
    sql+=db.connection.escape(username);
    db.connection.query(sql,(err,result) => {
        if(err){
            console.log(err);
            
            res.status(500).send("Database error");
            return;
        }
        if(result.length){
            res.status(200).send(result[0]);
        }
        else{
            res.status(402).send("There is no user with this username");
        }
    
    });


});
module.exports=router;