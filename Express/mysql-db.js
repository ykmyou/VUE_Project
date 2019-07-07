var mysql = require('mysql');

const dbHost = 'localhost';
const dbPort = 3306;

var connection = mysql.createConnection({
    host: dbHost,
    post: dbPort,
    user: 'root',
    password: 'root',
    database: 'vue_project'
});

module.exports = connection;