
const BACKUP_PATH='../ServerStorage';

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

import XLSX from 'xlsx';

const fs = require('fs').promises;

import FileRecv from './file-recv.js';
const Files = {};

import colRemap from './parseTypeDictionary';

import {operate, retrieveAndStore} from './database.js';

var app = express();

var server = app.listen(8080, function () {
  console.log('Server is listening 8080, forwarded from 80');
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

        console.log('begin receiving file');

        var fileStub;
        Files[data.name] = fileStub = new FileRecv(data.size, path.join(BACKUP_PATH, data.path));

        fileStub.open('a').then(function(fd){
            console.log("[start] file " + data.name + " desc created, ready to receive more.");
            fileStub.handler = fd;
            socket.emit('MORE', { 'position': 0, 'percent': 0 });
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
            // socket.emit('MORE', fileStub.progress());
        } else {
            socket.emit('MORE', fileStub.progress());
        }
    });

})


tableServer.on('connection', function (socket) {

    socket.on('REQUIRE_LIST', function(){
        console.log('received inquiring');
        fs.readdir(BACKUP_PATH).then(res => {
            socket.emit('LIST', {list: res});
        }).catch(err => {
            console.log('server reading local file failed', err);
        })    
    })

    socket.on('START', function({projName, sheetName, type}){
        console.log(projName, sheetName, type);
        let fileName = `RESTORED.${projName}.${sheetName}${type === undefined ? "" : "."+type}.JSON`,
        filePath = path.resolve(BACKUP_PATH, fileName);
        console.log('opening file', filePath);
        fs.open(filePath).then((fileHandle) => {
            Files[fileName] = {fileHandle, buffer: Buffer.alloc(524288), blockSize: 524288, currPosition: 0};
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
        let fileName = `RESTORED.${projName}.${sheetName}${type === undefined ? "" : "."+type}.JSON`;
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
        let filePath = `RESTORED.${project}.saved${sheet}${type===undefined ? "" : "."+type}.JSON`;

        fs.writeFile(path.join(BACKUP_PATH, filePath), JSON.stringify(data, null, 4)).then(res => {
            socket.emit('SAVED');
        })
    })

    socket.on('RESTORE', function(data){

        const initialTables = [
            'BALANCE',
            'JOURNAL',
            'CATEGORY',
        ];
    
        fs.readdir(BACKUP_PATH)
        .then(res => {
            let {name} = data;
            let fileNames = res.filter(path => path.includes(name) && path.includes('SOURCE'));
            
            console.log('ready to handle', fileNames);
            
            if (fileNames.every(e => e.includes('xls'))){
                socket.emit('RESTORE_MSG', '按Excel来还原数据');
                
                let balancesPath = fileNames.filter(e => e.includes('BALANCE')),
                    journalsPath = fileNames.filter(e => e.includes('JOURNAL')),
                    assistedsPath = fileNames.filter(e => e.includes('ASSISTED'));

                if((balancesPath.length !== journalsPath.length) || (journalsPath.length !== assistedsPath.length)){
                    socket.emit('RESTORE_MSG', '缺少某些期间/年份的数据表，对应期间的查询也无法生成，不过没有大碍。')
                }

                let data = {
                    BALANCE: [],
                    JOURNAL: [],
                    ASSISTED: []
                };

                Promise.all(fileNames.map(e => {
                    console.log('begin reading file', e);
                    return fs.readFile(path.resolve(BACKUP_PATH, e))
                    .then(fileBuffer => {
                        return XLSX.read(fileBuffer, {type: 'buffer'})
                    })
                    .catch(err => {
                        console.error(err, 'err in reading.')
                    })
                }))
                .then(result => {

                    for (let i = 0; i < fileNames.length; i++){

                        let [_S, _N, type, year, _FT] = fileNames[i].split('.');
                        let recRemap = colRemap[type];

                        let book = result[i],
                            sheet = book.Sheets[book.SheetNames[0]],
                            parsed = XLSX.utils.sheet_to_json(sheet);

                        for (let p = 0; p < parsed.length; p++){
                            let rec = parsed[p],
                                newRec = {};
                            for (let ent = 0; ent < recRemap.length; ent++){
                                let [oldKey, newKey] = recRemap[ent];
                                newRec[newKey] = rec[oldKey];
                            }

                            if (newRec.iyear === undefined){
                                newRec.iyear = year;
                            }

                            parsed[p] = newRec;
                        }

                        data[type].push(parsed);
                    }

                    return Promise.all(Object.keys(data).map(key => {
                        data[key] = data[key].flat();
                        return fs.writeFile(path.resolve(BACKUP_PATH, `RESTORED.${name}.${key}.JSON`), JSON.stringify(data[key]));
                    }))                    
                })
                .then(result => {
                    socket.emit('FILEPREPARED', {});
                })
                .catch(err => {
                    console.log('error during restoring xls files', err);
                })
            }
        });

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


