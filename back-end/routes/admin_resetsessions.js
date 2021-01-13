//Endpoint which deletes all charging sessions from db and 
//initialise default admin use ({username:admin, password:petrol4ever});

const express=require('express');
const router=express.Router();
const db=require('../db.js');
const config=require('../config.js');
const bcrypt = require('bcryptjs');

router.post('/',(req,res) => {
    var sql="DELETE FROM sessions";
    db.connection.query(sql,(err,result)=> {
        if(err){
            console.log(err);
            
            res.status(500).send({status:"failed"});
            return;
        }
        var password=bcrypt.hashSync(config.admin_default_password,8);
        sql="INSERT INTO users (username,password,role) VALUES ('";
        sql+=config.admin_default_username+"','"+password+"','admin'";
        sql+=") ON DUPLICATE KEY UPDATE password='"+password+"'";
        db.connection.query(sql,(err,result)=> {
            if(err){
                console.log(err);
                
                res.status(500).send({status:"failed"});
                return;
            }
            res.status(200).send({status:"OK"});
        });
    });
    

});

module.exports=router;