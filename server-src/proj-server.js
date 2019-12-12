const fs = require('fs').promises;
import del from 'del';
import path from 'path';

import {BACKUP_PATH} from './config';

const requireProjectList = (socket) => ({id}) => {
  console.log('Received requiring list of projects from ', id);
  fs.readdir(path.resolve(BACKUP_PATH, id), {withFileTypes: true}).then(res => {

    let list = res
      .filter(e => e.isDirectory())
      .map(e => {
        let [projName, year] = e.name.split('-')
        return {projName, year};
      })

    socket.emit('PROJECT_LIST', {list});
  }).catch(err => {
    console.log('server reading local file failed', err);
  })    
}

function copyFromPublic(fileName, id, projPath){
  let sourceFileName = fileName,
      sourcePath = path.join(BACKUP_PATH, 'public', sourceFileName),
      targetFileName = `SOURCE.${sourceFileName}`,
      targetPath = path.join(BACKUP_PATH, id, projPath, targetFileName);

  return {sourcePath, targetPath};
}

const createProject = (socket) => ({id, projName, year}) => {

  console.log('Creating directory of ', projName);

  let projPath = `${projName}-${year}`,
      filePath = path.join(BACKUP_PATH, id, projPath);

  fs.mkdir(filePath).then(() => {
      let {sourcePath, targetPath} = copyFromPublic('CASHFLOW_WORKSHEET.xlsx', id, projPath)
      return fs.copyFile(sourcePath, targetPath)
  }).then(() => {
      let {sourcePath, targetPath} = copyFromPublic('FINANCIAL_WORKSHEET.xlsx', id, projPath)
      return fs.copyFile(sourcePath, targetPath)
  }).then(() => {
      console.log('create directory done')
      socket.emit('CREATE_PROJECT_DONE', {});
  }).catch(({code}) => {
      socket.emit('ERROR', {msg: code});
  })
}

const deleteProject = (socket) => ({id, projName}) => {
  console.log('received DELETE', projName, path.join(BACKUP_PATH, id, projName));
  let projPath = path.join(BACKUP_PATH, id, projName);

  del([projPath], {force: true}).then(() => {
      console.log('remove directory done')
      socket.emit('DELETE_PROJECT_DONE', {});
  }).catch((err) => {
      console.log(err)
      socket.emit('ERROR', {msg: err.code})
  })
}

export default function(socket){

  socket.on('REQUIRE_PROJECT_LIST', requireProjectList(socket));
  socket.on('CREATE_PROJECT', createProject(socket));
  socket.on('DELETE_PROJECT', deleteProject(socket));

  return socket;
}