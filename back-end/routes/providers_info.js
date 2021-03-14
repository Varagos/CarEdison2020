const express=require('express');
const router=express.Router();
const auth=require('../middleware.js').user_auth;
const db=require('../db.js');

router.use(auth);

router.get('/',(req,res) => {
    var sql="SELECT * FROM providers";
    
    db.connection.query(sql,(err,result)=>{
        var providers=[];


        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        }
        if(result.length===0){
            res.status(402).send("No data for these parameters");
            return
        }
        for (provider of result){
            providers.push({
                provider_id: provider.provider_id,
                provider_name:provider.provider_name
            });
        }
        res.status(200).send(providers);
    });
});

module.exports=router;
