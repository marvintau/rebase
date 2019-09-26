
const BACKUP_PATH='/Users/yuetao/SimulateServerStorage';

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

const fs = require('fs').promises;

import FileRecv from './file-recv.js';
const Files = {};

import {operate, retrieveAndStore} from './database.js';

var app = express();

var server = app.listen(1337, function () {
  console.log('Server is listening 1337');
  console.log("run from the " + __dirname);
});

const io = require('socket.io').listen(server);
const tableServer = io.of('/TABLES');
const uploadServer = io.of('/UPLOAD');


app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

uploadServer.on('connection', function (socket) {

    socket.on('START', function (data) { 

        var fileStub;
        Files[data.name] = fileStub = new FileRecv(data.size, path.join(BACKUP_PATH, data.path));

        fileStub.open('a').then(function(fd){
            console.log("[start] file " + data.name + " desc created, ready to receive more.");
            fileStub.handler = fd;
            socket.emit('UPLOAD_MORE', { 'position': 0, 'percent': 0 });
        }).catch(function(err){
            console.error('[start] file open error: ' + err.toString());
        });
    });

    socket.on('SEND', function (data) {

        var fileStub = Files[data.name];
    
        fileStub.updateLen(data.segment);

        if (fileStub.isFinished()) {

            fileStub.write().then(function(){
                return fileStub.close();
            }).then(function(){
                return fs.readdir(BACKUP_PATH)
            }).then(res => {
                socket.emit('DONE', {list: res})
            })
        
        
        } else if (fileStub.data.length > 10485760) { //buffer >= 10MB
            fileStub.write().then(function(){
                fileStub.data = ''; //reset the buffer
                socket.emit('MORE', fileStub.progress());
            }).catch(function(err){
                console.error(err);
            });

        } else {
            socket.emit('MORE', fileStub.progress());
        }
    });

})


tableServer.on('connection', function (socket) {

    socket.on('REQUIRE_LIST', function(){
        fs.readdir(BACKUP_PATH).then(res => {
            socket.emit('LIST', {list: res});
        }).catch(err => {
            console.log('server reading local file failed', err);
        })    
    })

    socket.on('START', function({projName, sheetName, type}){
        let fileName = `${projName}.${sheetName}${type === undefined ? "" : "."+type}.JSON`,
            filePath = path.join(BACKUP_PATH, fileName);

        fs.open(filePath).then((fileHandle) => {
            Files[fileName] = {fileHandle, buffer: Buffer.alloc(524288), blockSize: 524288, currPosition: 0};
            console.log('opening file', fileName);
            socket.emit('TRANS', {projName, sheetName, progress: 0, data: undefined, type: 'FIRST'})
        }).catch(err => {
            console.log('opening file failed', err);
            if(err.code ==='ENOENT' && type ==="CONF"){
                console.log('CONF file not created yet. Now create it.');
                fs.writeFile(filePath, '[]')
                .then((res) => {
                    return fs.open(filePath)
                })
                .then((fileHandle) => {
                    Files[fileName] = {fileHandle, buffer: Buffer.alloc(524288), blockSize: 524288, currPosition: 0};
                    console.log('opening file', fileName);
                    socket.emit('TRANS', {projName, sheetName, progress: 0, data: undefined, type: 'FIRST'})
                })
                .catch(err => {
                    console.log('opening file failed, even just the newly touched one', err);
                })
            }
        })
    })

    socket.on('READY', function({projName, sheetName, type}){
        let fileName = `${projName}.${sheetName}${type === undefined ? "" : "."+type}.JSON`;
        let {fileHandle, buffer, blockSize, currPosition} = Files[fileName];

        let size;

        fileHandle.stat().then(res => {
        
            size = res.size;
            return fileHandle.read(buffer, 0, blockSize) 
        
        }).then(({bytesRead, buffer}) => {
            if(currPosition === size){
                socket.emit('DONE', {projName, sheetName})
                fileHandle.close();
            } else {
                Files[fileName].currPosition += bytesRead;
                let res = {type: 'REST', data : buffer.buffer.slice(0, bytesRead)};
                socket.emit('TRANS', {projName, sheetName, progress: currPosition/size, ...res})
            }
        }).catch(err=>{
            console.log(err, 'file')
        })
    })

    socket.on('SAVE', function({project, sheet, type, data}){
        let filePath = `${project}.${sheet}${type===undefined ? "" : "."+type}.JSON`;

        // console.log('SAVED FILE', filePath, data.slice(0, 20));

        fs.writeFile(path.join(BACKUP_PATH, filePath), JSON.stringify(data)).then(res => {
            socket.emit('SAVED');
        })
    })

    socket.on('RESTORE', function(data){

        const initialTables = [
            'BALANCE',
            'ENTRIES',
            'CATEGORY',
        ];
    
        console.log('begin restoring', data);
        operate('RESTORE', path.join(BACKUP_PATH, `${data.path}.BAK`)).then(res => {
            let dataPath = path.join(BACKUP_PATH, data.path);
            
            Promise.all(initialTables.map(method => retrieveAndStore(dataPath, method)))
                .then(res => {
                    return fs.writeFile(path.join(BACKUP_PATH, `${data.path}.RESTORED`))
                })
                .then(res => {
                    socket.emit('FILEPREPARED', {})
                })

        }).catch(err=>{
            console.error(err, 'restore');
            socket.emit('ERROR', {type:"ERROR", data:{err, from:"restore"}})
        });

        let processDetected = false;

        (function polling(){
            operate('PROGRESS').then(function(res){

                if(res.recordset.length === 0){
                    if(processDetected){
                        console.log('no more restoring process');
                        socket.emit('RESTOREDONE', {});    
                    } else {
                        setTimeout(polling, 100);
                    }

                } else {
                    processDetected = true;
                    console.log(res.recordset[0], 'prog');
                    socket.emit('PROG', {data : res.recordset[0] });
                    setTimeout(polling, 100);
                }
            }).catch(err=>{
                console.log(err, 'polling');
                socket.emit('ERROR', {type:"ERROR", data: {err, from:"polling"}})
            })
        })();
    })
});


