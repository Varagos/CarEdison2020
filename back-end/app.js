var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
require('dotenv').config()

// SSL Certifcate 
var options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};


var app = express();


// Create HTTPS server 
https.createServer(options, app).listen(process.env.PORT);

