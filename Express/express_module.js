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


app.listen(port, () => {
 console.log('Example app listening on port 3000!');
});

app.post('/login', (req, res, next) => {
	
	var user_id = req.body.id;
	var user_password = req.body.password;
	var info = [{ id : user_id }, { password : user_password }, {email : "bye"}, {name : "good"}]
  	res.send(info);
});


// app.get('/getarray', (req, res) => {

//   var arr = [{ key : "hello "},{key : "hi"},{key : "bye"},{key : "good"}]
//   res.send(arr);
// });