const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const hostname = '127.0.0.1';
const port = 3000;

var app = express();
var upload = multer();

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}));
//parse application/json
app.use(bodyParser.json());
// parse multipart/form-data
app.use(upload.array());

var mysqlDB = require('./mysql-db');
mysqlDB.connect();

app.listen(port, () => {
 console.log('Express Modules listening on port 3000!');
});

app.post('/login', (req, res) => {
	var user_id = req.body.id;
	var user_password = req.body.password;

	var info;
	mysqlDB.query('SELECT * FROM tb_user WHERE id = ? and password = ?'
        , [user_id, user_password], (err, rows, fields) => {
        if (!err) {
            if(rows[0] != undefined){
                info = JSON.stringify(rows);
                console.log('--> ' + info);
                res.send(info);
            }else{
                console.log('--> Can not find Account ' + user_id)
                res.send(null);
            }
        } else {
            console.log('--> ' + err);
            res.send(null);
        }
    });
});

//return true or false
app.post('/signup', (req, res) => {
	var user_id = req.body.id;
	var user_password = req.body.password;
	var user_email = req.body.email;
	var user_name = req.body.name;

	mysqlDB.query('INSERT INTO tb_user (id, password, email, name) VALUES (?, ?, ?, ?)'
        , [user_id, user_password, user_email, user_email], (err, rows, fields) => {
        if (!err) {
        	console.log('--> ' + JSON.stringify(rows));
        	res.send(true);
        } else {
            console.log('--> ' + err);
            res.send(false);
        } 
    });
});