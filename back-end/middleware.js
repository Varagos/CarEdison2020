const jwt=require('jsonwebtoken');
const config=require('./config.js');
const db=require('./db.js');

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
                    var sql="SELECT token FROM users WHERE username=";
                    sql+=db.connection.escape(decoded.username);
                    db.connection.query(sql,(err,result) => {
                        if(err){
                            console.log(err);
                            res.status(500).send("Database error");
                            return;
                        }
                        if(result[0].token===token){
                            next();
                        }
                        else{
                            res.status(401).send("You are not logged in");
                            return;
                        }
                        
                    });
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
                    var sql="SELECT token FROM users WHERE username=";
                    sql+=db.connection.escape(decoded.username);
                    db.connection.query(sql,(err,result) => {
                        if(err){
                            console.log(err);
                            res.status(500).send("Database error");
                            return;
                        }
                        if(!result[0].token){
                            res.status(401).send("You are not logged in");
                            return;
                        }
                        
                    });
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