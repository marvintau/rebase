
const BACKUP_PATH='../ServerStorage';

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import del from 'del';

const fs = require('fs').promises;

const DataStore = require('nedb'),
      db = new DataStore({filename: path.resolve(__dirname, '../passwords'), autoload: true});
db.ensureIndex({fieldName: 'username', unique: true});

import FileServ from './file-serv.js';
const Files = {};

import {operate, retrieveAndStore} from './database.js';

import XLSX from 'xlsx';
import bookRestore from './book-restore';

var app = express();

var server = app.listen(8080, function () {
  console.log('Server is listening 8080, for HTTPS');
  console.log("run from the " + __dirname);
});

const io = require('socket.io').listen(server);
const tableServer = io.of('/TABLES');
const uploadServer = io.of('/UPLOAD');
const authServer = io.of('/AUTH');

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('*', function(req, res){
    res.redirect('/');
})

// 上传文件的handler响应两种message：
// 
// PREP：接受一个包含文件名和文件尺寸的信息，创建文件并返回SEND指令，
//       包含文件名和起始位置。
// RECV：接受文件名和buffer的信息。返回新的百分比，和下次读取的位置。
//       客户端如果使用file position其实可以不需要这个位置。

uploadServer.on('connection', function (socket) {

    socket.on('CREATE', function({id, projName}) {

        console.log('Creating directory of ', projName);

        let filePath = path.join(BACKUP_PATH, id, projName);

        fs.mkdir(filePath).then(() => {
            console.log('create directory done')
            socket.emit('CREATE_DONE', {});
        }).catch(({code}) => {
            socket.emit('ERROR', {msg: code});
        })
    })

    socket.on('DELETE', function({id, projName}) {
        console.log('received DELETE', projName, path.join(BACKUP_PATH, id, projName));
        let projPath = path.join(BACKUP_PATH, id, projName);

        del([projPath], {force: true}).then(() => {
            console.log('remove directory done')
            socket.emit('DELETE_DONE', {});
        }).catch((err) => {
            console.log(err)
            socket.emit('ERROR', {msg: err.code})
        })
        // fs
    })

    socket.on('PREP', function ({id, projName, name, size}) { 

        let filePath = path.resolve(BACKUP_PATH, id, projName, name);

        fs.access(filePath)
        .then(() => {
            return fs.unlink(filePath)
        })
        .then(() => {
            console.log('File with same name has been removed.');
        })
        .finally(() => {
            Files[`${id}-${name}`] = new FileServ(filePath, size);
            socket.emit('SEND', {name, percent: 0, position: 0});    
        })
    });

    socket.on('RECV', function ({id, position, name, data}) {
        
        let afterWrite = ({part, percent, position}) => {
            console.log('afterWrite', part, percent, position);

            let label = {
                LAST: 'DONE',
                MOST: 'SEND',
            }[part]

            socket.emit(label, {name, percent, position})
        }

        Files[`${id}-${name}`].writeChunk(position, data, afterWrite);
    });

})


function getRestoredFileName(projName, sheetName, type){
    return `RESTORED.${projName}.${sheetName}${type === undefined ? "" : "."+type}.JSON`
}

tableServer.on('connection', function (socket) {

    socket.on('REQUIRE_LIST', ({id}) => {
        console.log('Received requiring list of projects from ', id);
        fs.readdir(path.resolve(BACKUP_PATH, id), {withFileTypes: true}).then(res => {
            socket.emit('LIST', {list: res.filter(e => e.isDirectory()).map(e => e.name)});
        }).catch(err => {
            console.log('server reading local file failed', err);
        })    
    })

    socket.on('SEND', function({id, projName, sheetName, type, position}){

        console.log(`SENDING ${projName}-${sheetName}${type? `-${type}`:''} FROM@ ${position}`, );
        
        let fileName = getRestoredFileName(projName, sheetName, type);
    
        // 以下是读取一个块之后的操作。块的大小是固定的，并封装在了FileServ中，不难
        // 理解，如果buffer读取的字节数小于一个块的长度，它肯定会是最后一个块（当然
        // 也可能是第一个）。我们没有设计额外的用于通知客户端已发送完的消息，当发送
        // 最后一个块时，标签为"DONE"，否则为"RECV"，其余信息都一样。


        let afterRead = ({part, percent, nextPos, buffer}) => {

            let label = {
                LAST: 'DONE',
                MOST: 'RECV',
            }[part];

            console.log(`SENDING ${projName}-${sheetName} ENDS@ ${nextPos} ${part} ${label}`);
            socket.emit(label, {projName, sheetName, percent, position: nextPos, data: buffer})
        }

        // 以下是在打开文件时执行的后续操作，当文件打开之后，就会直接读取文件
        // 并发送。特别注意这里的position，在afterOpen中的position总是0，尽管
        // 从client这边传来的position也一定是0，但是我们仍然强制它是0.

        // ifNotExist是当文件没找到时采取的操作。

        let notExisted = (err) => {
            if(err.code === 'ENOENT'){
                if(type === 'CONF'){
                    console.log('CONF not created yet.');
                    socket.emit('DONE', {projName, sheetName, data: Buffer.from('[]')})
                } else {
                    socket.emit('NOTFOUND', {sheetName, projName})
                }
            
            }
        }

        // 如果FileServ不存在，则创建一个。由于是已经存在于本地并待发送的文件，
        // 初始化的时候不需要指明size。会在open的时候获取。打开文件的后续操作即
        // 上面所述的发送第一个块。如果FileServ存在，则只需要完成后续的读取-发送
        // 操作，当然也是根据客户端发送来的position来读取。
        let fileID = `${id}-${fileName}`
        if(Files[fileID] === undefined){
            Files[fileID] = new FileServ(path.resolve(BACKUP_PATH, id, projName, fileName));
        }
        Files[fileID].readChunk(position, afterRead, notExisted)
    })

    socket.on('SAVE', function({id, projName, sheetName, type, data}){

        let dataBuffer;
        switch(typeof data){
            case "string" :
                console.log('received data as string');
                dataBuffer = Buffer.from(data);
                break;
            case 'object' :
                console.log('received data as object, whoa');
                dataBuffer = Buffer.from(JSON.stringify(data));
                break;
        }

        console.log(BACKUP_PATH, id, projName, fileName);
        let fileName = getRestoredFileName(projName, `saved${sheetName}`, type),
            filePath = path.resolve(BACKUP_PATH, id, projName, fileName);

        fs.writeFile(filePath, dataBuffer);
    })

    socket.on('EXPORT', function({id, projName, sheetName, data}){


        let xlsBook = XLSX.utils.book_new();

        if(Array.isArray(data)){
            let xlsSheet = XLSX.utils.json_to_sheet(data);
            xlsBook.SheetNames.push('sheet1');
            xlsBook.Sheets['sheet1'] = xlsSheet;
        } else {
            console.log(data);
            for (let key in data) {
                let xlsSheet = XLSX.utils.json_to_sheet(data[key]);
                xlsBook.SheetNames.push(key);
                xlsBook.Sheets[key] = xlsSheet;    
            }
        }

        let xlsOutput = XLSX.write(xlsBook, {bookType:'xlsx', type: 'binary'});

        function s2ab(s) { 
            var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
            var view = new Uint8Array(buf);  //create uint8array as viewer
            for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
            return buf;    
        }

        let outputArrayBuffed = s2ab(xlsOutput);

        socket.emit('EXPORTED', {outputArrayBuffed, projName, sheetName})
    })

    socket.on('RESTORE', function({projName, path}){

        bookRestore(projName)
        .then(result => {
            socket.emit('FILEPREPARED', {});
        })
        .catch(err => {
            console.log('error during restoring xls files', err);
        })

        // console.log('begin restoring', data);
        // operate('RESTORE', path.join(BACKUP_PATH, `${data.path}.BAK`)).then(res => {
        //     let dataPath = path.join(BACKUP_PATH, data.path);
            
        //     Promise.all(initialTables.map(method => retrieveAndStore(dataPath, method)))
        //         .then(res => {
        //             return fs.writeFile(path.join(BACKUP_PATH, `${data.path}.RESTORED`))
        //         })
        //         .then(res => {
        //             socket.emit('FILEPREPARED', {})
        //         })

        // }).catch(err=>{
        //     console.error(err, 'restore');
        //     socket.emit('ERROR', {type:"ERROR", data:{err, from:"restore"}})
        // });

        // let processDetected = false;

        // (function polling(){
        //     operate('PROGRESS').then(function(res){

        //         if(res.recordset.length === 0){
        //             if(processDetected){
        //                 console.log('no more restoring process');
        //                 socket.emit('RESTOREDONE', {});    
        //             } else {
        //                 setTimeout(polling, 100);
        //             }

        //         } else {
        //             processDetected = true;
        //             console.log(res.recordset[0], 'prog');
        //             socket.emit('PROG', {data : res.recordset[0] });
        //             setTimeout(polling, 100);
        //         }
        //     }).catch(err=>{
        //         console.log(err, 'polling');
        //         socket.emit('ERROR', {type:"ERROR", data: {err, from:"polling"}})
        //     })
        // })();
    })
});


authServer.on('connection', (socket) => {

    socket.on('LOGIN', ({username, password}) => {
        console.log(username, password, 'recved')
        db.findOne({username, password}, function(err, doc) {
            if (doc !== null) {
                console.log(doc, 'account found');
                let {username, nickname, _id: id} = doc;
                socket.emit('LOG_DONE', {username, nickname, id});
            } else {
                socket.emit('LOG_NOT_FOUND')
            }
        })
    })

    socket.on('REGISTER', ({username, password, nickname}) => {
        db.insert({username, password, nickname}, (err, newDoc) => {
            if(!err){
                console.log(newDoc, 'reged')
                let {_id: id} = newDoc;
                fs.mkdir(path.resolve(BACKUP_PATH, id))
                .then(() => {
                    socket.emit('REG_DONE', {id: newDoc._id});
                })
                .catch((err) => {
                    socket.emit('ERROR', JSON.stringify(err))
                })
            } else if (err.errorType === 'uniqueViolated'){
                socket.emit('REG_DUP_NAME');
            } else {
                socket.emit('ERROR', JSON.stringify(err));
            }
        })
    })
})