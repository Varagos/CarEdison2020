const express = require('express');
const https = require('https');
const fs = require('fs');
const config=require('./config.js');


// SSL Certifcate 
var options = {
  key: fs.readFileSync(config.ssl_key_path),
  cert: fs.readFileSync(config.ssl_cert_path)
};


var app = express();


// Create HTTPS server 
https.createServer(options, app).listen(config.port);

