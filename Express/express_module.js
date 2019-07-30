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

app.use('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
})

app.listen(port, () => {
 console.log('Express Modules listening on port 3000!');
});

app.post('/login', (req, res) => {
	var user_id = req.body.id;
	var user_password = req.body.password;

	var info = { msg: false, data: {}};
    console.log(req.body)
	mysqlDB.query('SELECT * FROM tb_user WHERE id = ? and password = ?'
        , [user_id, user_password], (err, rows, fields) => {
        if (!err) {
            if(rows[0] != undefined){
                info.msg = true;
                info.data = rows[0];
                console.log('--> ' + info);
                res.send(info);
            }else{
                info.msg = false;
                info.data = {}
                console.log('--> Can not find Account ' + user_id)
                res.send(info);
            }
        } else{
            info.msg = false;
            info.data = err;
            console.log('--> ' + info);
            res.send(info);
        }
    });
});

//return true or false
app.post('/signup', (req, res) => {
	var user_id = req.body.id;
	var user_password = req.body.password;
	var user_email = req.body.email;
	var user_name = req.body.name;

    var info = { msg: false, data: {}};
	mysqlDB.query('INSERT INTO tb_user (id, password, email, name) VALUES (?, ?, ?, ?)'
        , [user_id, user_password, user_email, user_name], (err, rows, fields) => {
        if (!err) {
        	console.log('--> ' + JSON.stringify(rows));
            info.msg = true;
            info.data = {id : user_id, email : user_email, name: user_name};
        	res.send(true);
        } else {
            console.log('--> ' + err);
            info.msg = false;
            info.data = err;
            res.send(false);
        } 
    });
});

function trim() {
  return this.replace(/(^\s*)|(\s*$)/gi, "");
}

function addWorker(info, job_id, job_workers, idx) {
    return new Promise((resolve, reject) => {
        console.log(job_workers[idx].trim());
        mysqlDB.query('INSERT INTO tb_worker (user_id, job_id) VALUES (?, ?)'
            , [job_workers[idx].trim(), job_id], (err, rows, fields) => {
            if (!err) {
                info.data.workers.push(job_workers[idx].trim());
                console.log('--> ' + JSON.stringify(rows));
                resolve(idx + 1);
            } else {
                console.log('--> ' + err);
                resolve(-1);
            } 
        });
    })
}


function addWorkers(res, info, job_id, job_workers, idx) {
    return new Promise((resolve, reject) => {
        if(idx == job_workers.length){
            info.msg = true;
            res.send(info);
        } else if(idx == -1){
            info.msg = false;
            res.send(info);
        } else {
            addWorker(info, job_id, job_workers, idx).then(nidx => addWorkers(res, info, job_id, job_workers, nidx));
        }
    })
}

app.post('/jobCreate', (req, res) => {
    var job_id = req.body.id;
    var job_title = req.body.title;
    var job_spec = req.body.spec;
    var job_status = req.body.status;
    var job_start_date = req.body.start_date;
    var job_end_date = req.body.end_date;
    var job_creator = req.body.creator;
    // workers는 list 형태로 req에 넣어주세요 // creator를 제외한 worker넣어주세요
    var job_workers = req.body.workers;

    var info = { msg: false, data: {workers:[]}};
    mysqlDB.query('INSERT INTO tb_job (id, title, spec, status, start_date, end_date, creator) VALUES (?, ?, ?, ?, ?, ?, ?)'
        , [job_id, job_title, job_spec, job_status, job_start_date, job_end_date, job_creator], (err, rows, fields) => {
        if (!err) {
            console.log('--> ' + JSON.stringify(rows));
            info.data = {id : job_id, title : job_title, spec : job_spec, status : job_status, start_date : job_start_date, end_date : job_end_date, workers : []};
            addWorkers(res, info, job_id, job_workers.split(','), 0);
        } else {
            console.log('--> ' + err);
            info.msg = false;
            info.data = err;
            res.send(false);
        } 
    });
});

app.post('/jobWorkerAdd', (req, res) => {
    var job_id = req.body.id;
    var job_workers = req.body.workers.split(',');
    var info = { msg: false, data: {workers:[]}};
    addWorkers(res, info, job_id, job_workers.split(','), 0);
});

app.post('/jobSync', (req, res) => {
    var info = { msg: false, data: { job_data: [], worker_data: [] }};
    mysqlDB.query('SELECT * FROM tb_job', (err, rows, fields) => {
        if (!err) {
            if(rows[0] != undefined){
                info.msg = true;
                info.data.job_data = rows;
                mysqlDB.query('SELECT * FROM tb_worker', (err, rows, fields) => {
                    if (!err) {
                        if(rows[0] != undefined){
                            info.msg = true;
                            info.data.worker_data = rows;
                            console.log('--> All Data Successfully Loaded');
                            res.send(info);
                        } else {
                            info.msg = false;
                            info.data = {};
                            console.log('--> Can not find Worker');
                            res.send(info);
                        }
                    } else {
                        info.msg = false;
                        info.data = err;
                        console.log('--> ' + info);
                        res.send(info);
                    }
                });
            } else {
                info.msg = false;
                info.data = {};
                console.log('--> Can not find Job');
                res.send(info);
            }
        } else {
            info.msg = false;
            info.data = err;
            console.log('--> ' + info);
            res.send(info);
        }
    });
});