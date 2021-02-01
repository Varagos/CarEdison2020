const express = require('express');
const https = require('https');
const fs = require('fs');
const config=require('./config.js');
const db=require('./db.js');

const loginrouter=require('./routes/login.js');
const logoutrouter=require('./routes/logout');

const admin_usermod_router=require('./routes/admin_usermod.js');
const admin_users_router=require('./routes/admin_users.js');
const admin_healthcheck=require('./routes/admin_healthcheck.js');
const admin_resetsessions=require('./routes/admin_resetsessions.js');
const admin_sessionsupd=require('./routes/admin_sessionsupd.js');

const sessions_point_router=require('./routes/sessions_point.js');
const sessions_station_router=require('./routes/sessions_station.js');
const sessions_vehicle_router=require('./routes/sessions_vehicle.js');
const sessions_provider_router=require('./routes/sessions_provider.js');

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

//attach routers to endppoints
app.use(config.base_url+'/login',loginrouter);
app.use(config.base_url+'/logout',logoutrouter);

app.use(config.base_url+'/admin/usermod',admin_usermod_router);
app.use(config.base_url+'/admin/users',admin_users_router);
app.use(config.base_url+'/admin/healthcheck',admin_healthcheck);
app.use(config.base_url+'/admin/resetsessions',admin_resetsessions);
app.use(config.base_url+'/admin/sessionsupd',admin_sessionsupd);

app.use(config.base_url+'/SessionsPerPoint',sessions_point_router);
app.use(config.base_url+'/SessionsPerStation',sessions_station_router);
app.use(config.base_url+'/SessionsPerEV',sessions_vehicle_router);
app.use(config.base_url+'/SessionsPerProvider',sessions_provider_router);

// Create HTTPS server 
https.createServer(options, app).listen(config.port, function() {
      console.log("Server is running on port " + config.port);
});
