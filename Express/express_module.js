const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql');

const hostname = '127.0.0.1';
const port = 3000;

const dbHost = 'localhost';
const dbPort = 3306;

var app = express();
var upload = multer();

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}));
//parse application/json
app.use(bodyParser.json());
// parse multipart/form-data
app.use(upload.array());


app.listen(port, () => {
 console.log('Example app listening on port 3000!');
});

app.post('/login', (req, res, next) => {
	var user_id = req.body.id;
	var user_password = req.body.password;

	var connection = mysql.createConnection({
		host: dbHost,
		post: dbPort,
		user: 'root',
		password: 'root',
		database: 'vue_project'
	});

	var info;
	connection.connect();
	connection.query("SELECT * FROM tb_user WHERE id = '" + user_id + "' and password = '" + user_password + "'", function (err, rows, fields) {
        connection.end();
        if (!err) {
            info = JSON.stringify(rows);
            console.log(info);
            res.send(info);
        } else {
            console.log('query error : ' + err);
            res.send(null);
        }
    });
});