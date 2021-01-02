const express = require('express');
const https = require('https');
const fs = require('fs');
const config=require('./config.js');
const db=require('./db.js');
const loginrouter=require('./routes/login.js');
const adminrouter=require('./routes/admin.js');
const logoutrouter=require('./routes/logout');

// SSL Certifcate 
var options = {
  key: fs.readFileSync(config.ssl_key_path),
  cert: fs.readFileSync(config.ssl_cert_path)
};
//Connect to database
db.connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

});

const app = express();

app.use(config.base_url+'/login',loginrouter);
app.use(config.base_url+'/admin',adminrouter);
app.use(config.base_url+'/logout',logoutrouter);
// Create HTTPS server 
https.createServer(options, app).listen(config.port);

