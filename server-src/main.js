
import path from 'path';
import express from 'express';
import sql from 'mssql';

import FileRecv from './file-recv.js';

const Files = {};

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
// for this subtle part, checkout 
// https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen/17697134#17697134
// https://stackoverflow.com/questions/24172909/socket-io-connection-reverts-to-polling-never-fires-the-connection-handler

// Express creates an application instance (app). By listening to port, app creates
// a server instance (server). Socket.io needs to listen to the server instance. Or
// the socket.io-client will continuously poll and not able to connect.

var app = express();

var server = app.listen(1337, function () {
  console.log('Server is listening 1337');
  console.log("run from the " + __dirname);
});

var io = require('socket.io').listen(server);

app.use(express.static(path.join(__dirname, '../public')));


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

io.sockets.on('connection', function (socket) {

    socket.on('start', function (data) { 

        var fileStub;
        Files[data.name] = fileStub = new FileRecv(data.size, path.join('D:/temp', data.name));

        fileStub.open().then(function(fd){
            console.log("[start] file " + data.name + " desc created, ready to receive more.");
            fileStub.handler = fd;
            socket.emit('more', { 'position': 0, 'percent': 0 });
        }).catch(function(err){
            console.error('[start] file open error: ' + err.toString());
        });
    });

    socket.on('single-table-request', function(message){

        sql.connect(config)
        .then(function(pool){
            return fetchTable(pool);
        }).then(function(res){
            socket.emit('msg', {type:"VOUCHER", voucher: res.recordset});
        }).catch(function(err){
            socket.emit('err', {type: err});
        }).finally(function(){
            sql.close();
        });
    });

    socket.on('upload', function (data) {

        var fileStub = Files[data.name];
    
        fileStub.updateLen(data.segment);

        if (fileStub.isFinished()) {

            fileStub.write().then(function(){
                return fileStub.close();
            }).then(function(){
                socket.emit('msg', { type:"UPLOAD_DONE", file: fileStub.name });
                return sql.connect(config);
            }).then(function(pool){
                return restore(pool, fileStub.filePath)
                        .then(function(res){
                            console.log(res);
                            socket.emit('msg', {type:"RESTORE_DONE"});
                            return fetchTable(pool, "code");
                        }).then(function(res){
                            // console.log(res);
                            socket.emit('msg', {type:"CODE", code: res.recordset});
                            return fetchTable(pool, "GL_accvouch");
                        }).then(function(res){
                            console.log("voucher length: " + res.recordset.length);
                            console.log("table size: " + JSON.stringify(res.recordset).length / 1048576);
                            socket.emit('msg', {type:"VOUCHER", voucher: res.recordset});
                            return fetchTable(pool, "GL_accsum");
                        }).then(function(res){
                            console.log("voucher length: " + res.recordset.length);
                            console.log("table size: " + JSON.stringify(res.recordset).length / 1048576);
                            socket.emit('msg', {type:"ACCSUM", accsum: res.recordset});
                        }).catch(function(err){
                            socket.emit('err', {type: err});
                        }).finally(function(){
                            // DURING DEVELOPMENT: delete the file anyway. 
                            return fileStub.delete();
                        });

            }).then(function(){
                fileStub = undefined;
                return sql.close();
            }).catch(function(err){
                console.error(err);
            });
        
        } else if (fileStub.data.length > 10485760) { //buffer >= 10MB
            fileStub.write().then(function(){
                fileStub.data = ''; //reset the buffer
                socket.emit('more', fileStub.progress());
            }).catch(function(err){
                console.error(err);
            });

        } else {
            socket.emit('more', fileStub.progress());
        }
    });
});


