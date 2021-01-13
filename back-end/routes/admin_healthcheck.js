//Endpoint which checks connectivity to database

const express=require('express');
const router=express.Router();
const db=require('../db.js');

router.get('/',(req,res) => {
    db.connection.ping((err) => {
        if (err) {
            console.log("Healthcheck failed");
            res.status(500).send({status:"failed"});
            return;
        }
        res.status(200).send({status:"OK"});
        
    });
      
});

module.exports=router;