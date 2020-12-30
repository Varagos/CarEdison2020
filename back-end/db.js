const config = require('./config');
const mysql= require('mysql');

//create database connection
const conn= mysql.createConnection({
    host: config.db_host,
    database: config.db_database,
    user: config.db_username,
    password: config.db_password
});

module.exports={
    connection: conn
};