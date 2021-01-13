const express=require('express');
const router=express.Router();
const db=require('../db.js');
const user_auth=require('../middleware.js').user_auth;
const jwt=require('jsonwebtoken');

//This route is accesible from logged in users
router.use(user_auth);

router.post('/',(req,res,next) => {
    var token=req.headers['x-observatory-auth'];
    //logout==delete token from db
    var sql="UPDATE users SET token=null WHERE username=";
    sql+=db.connection.escape(jwt.decode(token).username);
    db.connection.query(sql,(err,result) => {
        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        }
        res.sendStatus(200);
    })
});

module.exports=router;