//Endpoint which adds charging sessions to our database

const express=require('express');
const router=express.Router();
const db=require('../db.js');
const admin_auth=require('../middleware.js').admin_auth;
const formidable=require('express-formidable');
const parse = require('csv-parse/lib/sync')
const fs=require('fs').promises;

//This route is accessible only from admins who are looged in
router.use(admin_auth);
router.use(formidable());
router.post('/',async (req,res) => {
    req.setTimeout(180*1000);
    //open and read uploaded file
    const content=await fs.readFile(req.files.file.path,{encoding: 'utf-8'});
    //parse csv data to array 
    const records=parse(content,{
        columns: true
    });
    const fields=['start','finish','energy'];
    const required_fields=['point_id','vehicle_id','payment_id','pricing_id'];
    var flag=true;
    var counter=0;
    for(session of records){
        //check if there are all required fields (foreign keys) in rows
        for (field of required_fields){
            if(!session.hasOwnProperty(field)){
                res.status(400).send(field+" field is required");
                return;
            }
        }
        var cols=[];
        var vals=[];
        for (field in session){
            if(!fields.includes(field) && !required_fields.includes(field)){
                res.status(400).send("unknown field "+field);
                return;
            }
            if(session[field]){
                cols.push(field);
                vals.push(session[field]);
            }
            else{
                //required field has no value
                if(required_fields.includes(field)){
                    flag=false;
                    break;
                }
            }
        }
        if(!flag){
            break;
        }
        var sql="INSERT INTO sessions ("+cols.join(',')+") ";
        sql+="VALUES ("+vals.join(',')+")";
        db.connection.query(sql,(err,result) => {
            if(err){
                console.log(err);
                
                res.status(500).send("Database error");
                return;
                
            }
            counter++;

        });
    }
    //ask db for how many sessions there are
    sql="SELECT count(*) as total FROM sessions";
    
    db.connection.query(sql,(err,result) => {
        if(err){
            console.log(err);
                
            res.status(500).send("Database error");
            return;
                
        }
        var json={
            SessionsInUploadedFile:records.length,
            SessionsImported:counter,
            TotalSessionsInDatabase:result[0].total
        };
        res.status(200).send(json);
    });
    
 
});
module.exports=router;