const jwt=require('jsonwebtoken');
const config=require('../config.js');

module.exports={
    user_auth:((req,res,next) => {
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
        
    }),
    admin_auth:((req,res,next) => {
        //grab token from req.headers
        var token=req.headers['x-observatory-auth'];
        if(token){
                jwt.verify(token,config.secret,(err,decoded) => {
                    if(err){
                        res.status(401).send("Invalid token");
                        return;
                    }
                    //only this part is added to the
                    //user_auth function
                    if(decoded.role!='admin'){
                        res.status(401).send("Token does not belong to an admin");
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
        
    })
};