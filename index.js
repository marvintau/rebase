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
    password: "1q0o2w9i3e8u",
    server: "192.168.0.127",
    // If you're on Windows Azure, you will need this:
    options: {encrypt: true},
    authentication: {
      type: "default",
      options: {  
        userName: "marvin",
        password: "1q0o2w9i3e8u",
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
            "NOUNLOAD,  REPLACE,  STATS = 10;"                         ;                                                      ;

    return pool.request().query(query);
}

var summary = function(pool){

    const query = 
    "select rowstat.Tablename, lines, Tabledefine from ("                                              +
    "    select tab.name as Tablename, "                                                               +
    "        sum(part.rows) as lines "                                                                 +
    "    from [rebase].sys.tables tab "                                                                +
    "        inner join [rebase].sys.partitions part "                                                 +
    "            on tab.object_id = part.object_id "                                                   +
    "    where part.index_id IN (1, 0) "                                                               +
    "    group by tab.name "                                                                           +
    ") rowstat inner join rebase.dbo.RPT_GRPDEF existing on rowstat.Tablename = existing.Tablename "   +
    "where rowstat.Tablename like 'GL_acc%' ";

    return pool.request().query(query);
}

var voucher = function(pool){

    const query =
    "use rebase; "                                                                           +
    " "                                                                                      +
    "declare @query nvarchar(max), "                                                         +
    "        @tablename nvarchar(max); "                                                     +
    "set @tablename = 'GL_accvouch'; "                                                       +
    " "                                                                                      +
    "select @query = 'select ' + SUBSTRING( "                                                +
    "    (select ', '+cols.COLUMN_NAME + ' as ' + defs.FieldDef "                            +
    "        from rebase.INFORMATION_SCHEMA.COLUMNS cols "                                   +
    "            inner join (select * from RPT_ItmDEF where  "                               +
    "                FieldName not like '%engl' and  "                                       +
    "                FieldName not like 'cdefine%' and  "                                    +
    "                FieldName not like '%edit' and "                                        +
    "                FieldName not like '%Input' "                                           +
    "            ) defs "                                                                    +
    "            on cols.COLUMN_NAME = defs.FieldName and cols.TABLE_NAME = defs.TableName " +
    "            where cols.TABLE_NAME= @tablename "                                         +
    "        for xml path('')), "                                                            +
    "3, 9999) + ' from ' + @tablename; "                                                     +
    " "                                                                                      +
    "exec(@query) "                                                                          ;

    return pool.request().query(query);
}

var code = function(pool){

    const query =
    "use rebase; "                                                                           +
    " "                                                                                      +
    "declare @query nvarchar(max), "                                                         +
    "        @tablename nvarchar(max); "                                                     +
    "set @tablename = 'code'; "                                                              +
    " "                                                                                      +
    "select @query = 'select ' + SUBSTRING( "                                                +
    "    (select ', '+cols.COLUMN_NAME + ' as ' + defs.FieldDef "                            +
    "        from rebase.INFORMATION_SCHEMA.COLUMNS cols "                                   +
    "            inner join (select * from RPT_ItmDEF where  "                               +
    "                FieldName not like '%engl' and  "                                       +
    "                FieldName not like 'cdefine%' and  "                                    +
    "                FieldName not like '%edit' and "                                        +
    "                FieldName not like '%Input' "                                           +
    "            ) defs "                                                                    +
    "            on cols.COLUMN_NAME = defs.FieldName and cols.TABLE_NAME = defs.TableName " +
    "            where cols.TABLE_NAME= @tablename "                                         +
    "        for xml path('')), "                                                            +
    "3, 9999) + ' from ' + @tablename; "                                                     +
    " "                                                                                      +
    "exec(@query) "                                                                          ;

    return pool.request().query(query);

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

    // socket.on('disconnect', function(){
    //     // handle the case that user incidentally refresh the page.
    //     // Since the local file is saved on half, we have to start
    //     // 
    //     for (let filename in Files) if(Files[filename] !== undefined){
    //         fs.unlink(Files[filename].filePath);
    //     }
    // })

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
                            socket.emit('msg', {type:"RESTORE_DONE"});
                            return summary(pool);
                        })
                        .then(function(res){
                            console.log(res);
                            socket.emit('msg', {type:"SUMMARY", summary: res.recordset});
                            return code(pool);
                        }).then(function(res){
                            console.log(res);
                            socket.emit('msg', {type:"CODE", code: res.recordset});
                            return voucher(pool);
                        }).then(function(res){
                            console.log("voucher length: " + res.recordset.length);
                            console.log("table size: " + JSON.stringify(res.recordset).length / 1048576);
                            socket.emit('msg', {type:"VOUCHER", voucher: res.recordset});
                        }).catch(function(err){
                            socket.emit('err', {type: err});
                        }).finally(function(){
                            // DURING DEVELOPMENT: delete the file anyway. 
                            return fs.unlink(fileStub.filePath);
                        });

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


