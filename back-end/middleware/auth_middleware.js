const jwt=require('jsonwebtoken');
const config=require('../config.js');

module.exports=((req,res,next) => {
    //grab token from req.headers
    var token=req.headers['x-observatory-auth'];
    if(token){
            jwt.verify(token,config.secret,(err,decoded) => {
                if(err){
                    res.status(401).send("Invalid token");
                    return;
                }
                //Token ok
                next();
            });
    }
    else{
        res.status(401).send("No token provided");
        return;
    }
    
});