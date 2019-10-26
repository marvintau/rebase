
const BACKUP_PATH='../ServerStorage';

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

import XLSX from 'xlsx';

const fs = require('fs').promises;

import FileServ from './file-serv.js';
const Files = {};

import colRemap from './parseTypeDictionary';

import {operate, retrieveAndStore} from './database.js';

var app = express();

var server = app.listen(1337, function () {
  console.log('Server is listening 1337, for HTTPS');
  console.log("run from the " + __dirname);
});

const io = require('socket.io').listen(server);
const tableServer = io.of('/TABLES');
const uploadServer = io.of('/UPLOAD');


app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


// 上传文件的handler响应两种message：
// 
// PREP：接受一个包含文件名和文件尺寸的信息，创建文件并返回SEND指令，
//       包含文件名和起始位置。
// RECV：接受文件名和buffer的信息。返回新的百分比，和下次读取的位置。
//       客户端如果使用file position其实可以不需要这个位置。

uploadServer.on('connection', function (socket) {

    socket.on('PREP', function ({name, size}) { 

        Files[name] = new FileServ(path.join(BACKUP_PATH, name), size);
        socket.emit('SEND', {name, percent: 0, position: 0});

    });

    socket.on('RECV', function ({name, data}) {
        
        let afterWrite = ({part, percent, position}) => {

            let label = {
                LAST: 'DONE',
                MOST: 'SEND',
            }[part]

            socket.emit(label, {name, percent, position})
        }

        Files[name].writeChunk(data, afterWrite);
    });

})


function getRestoredFileName(projName, sheetName, type){
    return `RESTORED.${projName}.${sheetName}${type === undefined ? "" : "."+type}.JSON`
}

tableServer.on('connection', function (socket) {

    socket.on('REQUIRE_LIST', function(){
        console.log('received inquiring');
        fs.readdir(BACKUP_PATH).then(res => {
            socket.emit('LIST', {list: res});
        }).catch(err => {
            console.log('server reading local file failed', err);
        })    
    })

    socket.on('SEND', function({projName, sheetName, type, position}){

        console.log(`SENDING ${projName}-${sheetName} FROM@ ${position}`, );
        
        let fileName = getRestoredFileName(projName, sheetName, type);
    
        // 以下是读取一个块之后的操作。块的大小是固定的，并封装在了FileServ中，不难
        // 理解，如果buffer读取的字节数小于一个块的长度，它肯定会是最后一个块（当然
        // 也可能是第一个）。我们没有设计额外的用于通知客户端已发送完的消息，当发送
        // 最后一个块时，标签为"DONE"，否则为"RECV"，其余信息都一样。


        let afterRead = ({part, percent, position, buffer}) => {

            let label = {
                LAST: 'DONE',
                MOST: 'RECV',
            }[part];

            console.log(`SENDING ${projName}-${sheetName} ENDS@ ${position} ${label}`);
            socket.emit(label, {projName, sheetName, percent, position, data: buffer})
        }

        // 以下是在打开文件时执行的后续操作，当文件打开之后，就会直接读取文件
        // 并发送。特别注意这里的position，在afterOpen中的position总是0，尽管
        // 从client这边传来的position也一定是0，但是我们仍然强制它是0.

        // ifNotExist是当文件没找到时采取的操作。

        let notExisted = (err) => {
            if(err.code === 'ENOENT' && type === 'CONF'){
                console.log('CONF not created yet.');
                socket.emit('DONE', {projName, sheetName, data: Buffer.from('[]')})
            }
        }

        // 如果FileServ不存在，则创建一个。由于是已经存在于本地并待发送的文件，
        // 初始化的时候不需要指明size。会在open的时候获取。打开文件的后续操作即
        // 上面所述的发送第一个块。如果FileServ存在，则只需要完成后续的读取-发送
        // 操作，当然也是根据客户端发送来的position来读取。
        if(Files[fileName] === undefined){
            Files[fileName] = new FileServ(path.resolve(BACKUP_PATH, fileName));
        }
        Files[fileName].readChunk(position, afterRead, notExisted)
    })

    socket.on('SAVE', function({projName, sheetName, type, data}){

        console.log(data);

        // let dataBuffer;
        // if (typeof data === 'string'){
        //     dataBuffer = Buffer.from(data)
        // }

        // let fileName = getRestoredFileName(projName, sheetName, type);
        
        // if (Files[fileName] !== undefined){

        // }
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


