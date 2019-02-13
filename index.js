const express = require('express');
const path    = require('path');
const cors    = require('cors');
const fs      = require('fs').promises;
// const SQLConn = require('tedious').Connection;
// const SQLReq  = require('tedious').Request;

const sql = require('mssql');
const Files = {};

class FileEntry {

    constructor(size, path){
        this.fileSize = size,
        this.filePath = path,
        this.data     = '',
        this.currLen  = 0,
        this.handler  = null
    }

    getPercent () {
        return parseInt((this.currLen / this.fileSize) * 100);
    };
    getPosition () {
        return this.currLen / 524288;
    };

    updateLen(data){
        this.data    += data;
        this.currLen += data.length;
    }

    isFinished(){
        return this.fileSize === this.currLen;
    }

    write(){
        // returns a promise
        return this.handler.write(this.data, 0, "Binary");
    }

    open(){
        // https://nodejs.org/api/fs.html#fs_fspromises_open_path_flags_mode
        // returns a Promise that finally resolved a FileHandle object
        return fs.open(this.filePath, 'a', 0o755);
    }

    close(){
        return this.handler.close();
    }

    progress(){
        return  {
            'position': this.getPosition(),
            'percent':  this.getPercent()
        }
    }
}

var config = {
    user: "marvin",
    password: "asdasdasd",
    server: "192.168.0.127",
    // If you're on Windows Azure, you will need this:
    options: {encrypt: true},
    authentication: {
      type: "default",
      options: {  
        userName: "marvin",
        password: "asdasdasd",
    }
  }
};


// for this subtle part, checkout 
// https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen/17697134#17697134
// https://stackoverflow.com/questions/24172909/socket-io-connection-reverts-to-polling-never-fires-the-connection-handler

// Express creates an application instance (app). By listening to port, app creates
// a server instance (server). Socket.io needs to listen to the server instance. Or
// the socket.io-client will continuously poll and not able to connect.

var app = express();

var server = app.listen(1337, function () {
  console.log('Server is listening 1337');
});

var io = require('socket.io').listen(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

var restoreBackupQuery = function(path){
    return "" +
    "USE master;" +
    "RESTORE DATABASE rebase FROM  DISK = N'"+path+"' WITH  FILE = 1," + 
    "MOVE N'Ufmodel'     TO N'C:\\Program Files\\Microsoft SQL Server\\MSSQL10_50.SQLEXPRESS\\MSSQL\\DATA\\rebase.mdf',"+ 
    "MOVE N'Ufmodel_LOG' TO N'C:\\Program Files\\Microsoft SQL Server\\MSSQL10_50.SQLEXPRESS\\MSSQL\\DATA\\rebase.ldf',"+ 
    "NOUNLOAD,  REPLACE,  STATS = 10";
    
}

io.sockets.on('connection', function (socket) {

    socket.on('start', function (data) { 

        var fileStub;
        Files[data.name] = fileStub = new FileEntry(data.size, path.join('D:/temp', data.name));

        fileStub.open().then(function(fd){
            console.log("[start] file " + data.name + " desc created, ready to receive more.");
            fileStub.handler = fd;
            socket.emit('more', { 'position': 0, 'percent': 0 });
        }).catch(function(err){
            console.error('[start] file open error: ' + err.toString());
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
                return pool.request()
                .query(restoreBackupQuery(fileStub.filePath));
            }).then(function(result){
                socket.emit('msg', {type:"RESTORE_DONE"});
                return fs.unlink(fileStub.filePath);
            }).then(function(){
                delete fileStub;
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


