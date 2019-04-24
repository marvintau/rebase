
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

import expressJWT  from 'express-jwt';
import jwt from 'jsonwebtoken';

import authConfig from '../config.json';

import FileRecv from './file-recv.js';
const Files = {};

import sql from 'mssql';
let config = {
    user: "marvin",
    password: "1q0o2w9i3e8u",
    server: "192.168.0.127",
    options: {encrypt: true},
    authentication: {
      type: "default",
      options: {  
        userName: "marvin",
        password: "1q0o2w9i3e8u",
    }
  }
}

var app = express();

var server = app.listen(1337, function () {
  console.log('Server is listening 1337');
  console.log("run from the " + __dirname);
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
app.use(expressJWT({secret: authConfig.secret}).unless({path: ['/users/authenticate/']}));


const users = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }];

app.post('/users/authenticate/', function authenticate(req, res, next) {

    (({username, password}) => new Promise(function(resolve, reject){
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const { password, ...userWOPass } = user;
            resolve({
                token:jwt.sign({ sub: user.id }, authConfig.secret),
                ...userWOPass
            });
        } else resolve(undefined);
    }))(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: '啊啦啦，用户名或密码不对' }))
        .catch(err => next(err));
});

app.use(function errorHandler(err, req, res, next) {

    if (typeof (err) === 'string') {
        // custom application error
        return res.status(400).json({ message: err });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ message: 'Invalid Token' });
    }

    // default to 500 server error
    console.log(err);
    return res.status(500).json({ message: err.message });
})

var restore = function(pool, path){
    const query = 
        "declare @mdfpath nvarchar(max),"                          +
        "        @ldfpath nvarchar(max)"                           +
        ""                                                         +
        "select @mdfpath = [0], @ldfpath = [1]"                    +
        "    from (select type, physical_name "                    +
        "            from sys.master_files"                        +
        "            WHERE database_id = DB_ID(N'rebase'))"        +
        "    as paths "                                            +
        "pivot(max(physical_name) for type in ([0], [1])) as pvt;" +
        ""                                                         +
        "restore database rebase from disk = N'"+path+"' WITH FILE = 1," +
        "MOVE N'Ufmodel'     TO @mdfpath,"                         +
        "MOVE N'Ufmodel_LOG' TO @ldfpath, "                        +
        "NOUNLOAD,  REPLACE,  STATS = 10;"                         ;

    return pool.request().query(query);
}

var fetchTable = function (pool, tableName){

    let req = pool.request();
    return req.query("use rebase; select * from "+tableName+";");
}

// io.sockets.on('connection', function (socket) {

//     socket.on('start', function (data) { 

//         var fileStub;
//         Files[data.name] = fileStub = new FileRecv(data.size, path.join('D:/temp', data.name));

//         fileStub.open().then(function(fd){
//             console.log("[start] file " + data.name + " desc created, ready to receive more.");
//             fileStub.handler = fd;
//             socket.emit('more', { 'position': 0, 'percent': 0 });
//         }).catch(function(err){
//             console.error('[start] file open error: ' + err.toString());
//         });
//     });

//     socket.on('single-table-request', function(message){

//         sql.connect(config)
//         .then(function(pool){
//             return fetchTable(pool);
//         }).then(function(res){
//             console.log(Object.keys(res));
//             socket.emit('msg', {type:"VOUCHER", voucher: res.recordset});
//         }).catch(function(err){
//             socket.emit('err', {type: err});
//         }).finally(function(){
//             sql.close();
//         });
//     });

//     socket.on('upload', function (data) {

//         var fileStub = Files[data.name];
    
//         fileStub.updateLen(data.segment);

//         if (fileStub.isFinished()) {

//             fileStub.write().then(function(){
//                 return fileStub.close();
//             }).then(function(){
//                 socket.emit('msg', { type:"UPLOAD_DONE", file: fileStub.name });
//                 return sql.connect(config);
//             }).then(function(pool){
//                 return restore(pool, fileStub.filePath)
//                         .then(function(res){
//                             console.log(res);
//                             socket.emit('msg', {type:"RESTORE_DONE"});
//                             return fetchTable(pool, "code");
//                         }).then(function(res){
//                             socket.emit('msg', {type:"DATA", tableName:"SYS_code", data: res.recordset});
//                             return pool.query('select * from RPT_ItmDEF');
//                         }).then(function(res){
//                             socket.emit('msg', {type:"DATA", tableName:"SYS_RPT_ItmDEF", data: res.recordset});
//                             return fetchTable(pool, "GL_accvouch");
//                         }).then(function(res){
//                             socket.emit('msg', {type:"DATA", tableName:"GL_accvouch", data:res.recordset});
//                             return fetchTable(pool, "GL_accsum");
//                         }).then(function(res){
//                             socket.emit('msg', {type:"DATA", tableName:"GL_accsum", data:res.recordset});
//                         }).catch(function(err){
//                             socket.emit('err', {type: err});
//                         }).finally(function(){
//                             // DURING DEVELOPMENT: delete the file anyway. 
//                             return fileStub.delete();
//                         });

//             }).then(function(){
//                 fileStub = undefined;
//                 return sql.close();
//             }).catch(function(err){
//                 console.error(err);
//             });
        
//         } else if (fileStub.data.length > 10485760) { //buffer >= 10MB
//             fileStub.write().then(function(){
//                 fileStub.data = ''; //reset the buffer
//                 socket.emit('more', fileStub.progress());
//             }).catch(function(err){
//                 console.error(err);
//             });

//         } else {
//             socket.emit('more', fileStub.progress());
//         }
//     });
// });


