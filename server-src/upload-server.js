const fs = require('fs').promises;
import path from 'path';

import FileServ from './file-serv';
import bookRestore from './book-restore';

import {BACKUP_PATH} from './config';


const prepareToReceive = (socket, fileHolder) => ({id, projName, name, size}) => { 

  console.log('prep to receive', id, projName, name, size);
  let filePath = path.resolve(BACKUP_PATH, id, projName, name);

  fs.access(filePath)
  .then(() => {
    console.log('File with same name has been removed.');
    return fs.unlink(filePath)
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    console.log(filePath, size, 'finally')
    fileHolder[`${id}-${projName}-${name}`] = new FileServ(filePath, size);
    socket.emit('SEND', {name, percent: 0, position: 0});    
  })
}

const receive = (socket, fileHolder) => ({id, position, projName, name, data}) => {
        
  console.log('receiving', id, name);
  let afterWrite = ({part, percent, position}) => {
      console.log('afterWrite', part, percent, position);

      let label = {
          LAST: 'RECEIVE_DONE',
          MOST: 'SEND',
      }[part]

      socket.emit(label, {name, percent, position})
  }

  fileHolder[`${id}-${projName}-${name}`].writeChunk(position, data, afterWrite);
}

const restore = (socket) => ({id, projName}) => {

  bookRestore(id, projName)
  .then(result => {
      socket.emit('RESTORE_DONE', {});
  })
  .catch(err => {
      console.log('error during restoring xls files', err);
  })

}

export default function(socket, fileHolder){

  socket.on('PREPARE_TO_RECEIVE', prepareToReceive(socket, fileHolder));
  socket.on('RECEIVE', receive(socket, fileHolder));
  socket.on('RESTORE', restore(socket));
  return socket;
}

// 以下部分代码留在这里，等到收集到足够多的.bak文件再继续启用

// import {operate, retrieveAndStore} from './database.js';

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