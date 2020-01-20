import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import copy from 'recursive-copy';

import {BACKUP_PATH} from './config'

const fs = require('fs').promises;

const DataStore = require('nedb'),
      db = new DataStore({filename: path.resolve(__dirname, '../passwords'), autoload: true});
db.ensureIndex({fieldName: 'username', unique: true});

import FileServ from './file-serv.js';
const Files = {};


import XLSX from 'xlsx';
import bookRestore from './book-restore';

var app = express();

var server = app.listen(8088, function () {
  console.log('Server is listening 8080, for HTTPS');
  console.log("run from the " + __dirname);
});

const io = require('socket.io').listen(server);

import projectServerInit from './proj-server';
import uploadServerInit from './upload-server';
const tableServer = io.of('/TABLES');
const uploadServer = io.of('/UPLOAD');
const projServer = io.of('/PROJECT');
const authServer = io.of('/AUTH');

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('*', function(req, res){
    res.redirect('/');
})

projServer.on('connection', function (socket) {
    socket = projectServerInit(socket);
})

uploadServer.on('connection', function(socket) {
    socket = uploadServerInit(socket, Files);
})

function getRestoredFileName(sheetName, type){
    return `RESTORED.${sheetName}${type === undefined ? "" : "."+type}.JSON`
}

tableServer.on('connection', function (socket) {


    socket.on('SEND', function({id, projName, sheetName, type, position}){

        console.log(`SENDING ${projName}-${sheetName}${type? `-${type}`:''} FROM@ ${position}`, );
        
        let fileName = getRestoredFileName(sheetName, type);
        console.log('restored filename', fileName);
    
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
        let fileID = `${id}-${fileName}-${projName}`
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
        let fileName = getRestoredFileName(`saved${sheetName}`, type),
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
                    return copy(path.resolve(BACKUP_PATH, 'public', '示例项目-2018'), path.resolve(BACKUP_PATH, id, '示例项目-2018'))
                    .catch((err) => {
                        console.log('file copying', err);
                    })
                })
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