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
    const content=await fs.readFile(req.files.file.path,{encoding: 'utf-8'});
    const records=parse(content,{
        columns: true
    });
    console.log(records);
    console.log(records[0].finish);
});
module.exports=router;