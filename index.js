var express = require('express');
var path    = require('path');
var cors    = require('cors');
var fs      = require('fs');

var SQLConn = require('tedious').Connection;
var SQLReq  = require('tedious').Request;

var Files = {};

var config = {
    userName: "marvin",
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

var app = express();

var server = app.listen(1337, function () {
  console.log('Server is listening 1337');
});

var io = require('socket.io').listen(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

var restoreBackupQuery = function(path){
    console.log("begin to restore backup", path);
    return "" +
    "RESTORE DATABASE rebase FROM  DISK = N'"+path+"' WITH  FILE = 1," + 
    "MOVE N'Ufmodel'     TO N'C:\\Program Files\\Microsoft SQL Server\\MSSQL10_50.SQLEXPRESS\\MSSQL\\DATA\\rebase.mdf',"+ 
    "MOVE N'Ufmodel_LOG' TO N'C:\\Program Files\\Microsoft SQL Server\\MSSQL10_50.SQLEXPRESS\\MSSQL\\DATA\\rebase.ldf',"+ 
    "NOUNLOAD,  REPLACE,  STATS = 10";
    
}

var restoreBackup = function(filePath, doneCallback){

    var query = restoreBackupQuery(filePath);
    var sqlConn = new SQLConn(config);

    sqlConn.on('connect', function(err) {  
        
        if(err) console.log(err);

        sqlReq = new SQLReq(query, function(err, rowCount) {
            console.log(err);
        });
        sqlReq.on("doneProc", function(rowCount, more, returnStatus, rows){
            console.log(more, returnStatus);
        })
        sqlReq.on("done", function(rowCount, more, rows){
            doneCallback();
        })

        sqlConn.execSql(sqlReq);

    });  

}

io.sockets.on('connection', function (socket) {

    socket.on('start', function (data) { 

        console.log("received upload request:", data);

        var name = data.name;
        var size = data.size;
        var filePath = path.join('D:/temp', name);
        Files[name] = { // define storage structure
            fileSize: size,
            data: '',
            currLen: 0,
            handler: null,
            filePath: filePath,
        };
        Files[name].getPercent = function () {
            return parseInt((this.currLen / this.fileSize) * 100);
        };
        Files[name].getPosition = function () {
            return this.currLen / 524288;
        };
        fs.open(Files[name].filePath, 'a', 0755, function (err, fd) {
            if (err)
                console.log('[start] file open error: ' + err.toString());
            else {
                console.log("file " + name + " desc created, ready to receive more.");
                Files[name].handler = fd; // the file descriptor
                socket.emit('more', { 'position': 0, 'percent': 0 });
            }
        });        
    });

    socket.on('upload', function (data) {
        var name    = data.name;
        var segment = data.segment;
    
        Files[name].currLen += segment.length;
        Files[name].data += segment;

        if (Files[name].currLen === Files[name].fileSize) {
            fs.write(Files[name].handler, Files[name].data, null, 'Binary', 
              function (err, written) {
                
                if(err) {console.log(err);} else fs.close(Files[name].handler, function(err){
                    if(err) {console.log(err);} else {
                        socket.emit('done', { file: Files[name].name });
                        restoreBackup(Files[name].filePath)
                        delete Files[name];                            
                    }
                }) 
            });
        
        } else if (Files[name].data.length > 10485760) { //buffer >= 1MB
          console.log(Files[name].handler);
          fs.write(Files[name].handler, Files[name].data, null, 'Binary', 
              function (err, written) {
                Files[name].data = ''; //reset the buffer
                socket.emit('more', {
                    'position': Files[name].getPosition(),
                    'percent': Files[name].getPercent()
                });
            });
        } else {
            socket.emit('more', {
                'position': Files[name].getPosition(),
                'percent': Files[name].getPercent()
            });
        }
    });
});



