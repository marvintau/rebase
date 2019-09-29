import React from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';


import Formwell from 'formwell';
import ProjectManager from './ProjectManager';

import {address} from './Config.js';


const Log = styled.div`
    margin: 10px;
    font-size: 80%;
    line-height: 2em;
    height: 250px;
`

const WorkAreaContainer = styled.div`
    width: 800px;
    font-size : 85%;
    margin: 10px;
`

const FlexBox = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
`


export default class BookManagerComp extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            logs: [],
            currProjectName: undefined,
            currSheet: undefined,
            currRecordPath : []
        }

        this.sheets = {};

        this.socket = io(`http://${address}/TABLES`);

        this.socket.on('TRANS', ({progress, type, data, projName, sheetName})=>{

            switch(type){
                case 'FIRST':
                    this.sheets[sheetName].blobs = [];
                    this.socket.emit('READY', {projName, sheetName, type: this.sheets[sheetName].type});
                    break;
                case 'REST':
                    this.sheets[sheetName].blobs.push(data);
                    this.socket.emit('READY', {projName, sheetName, type: this.sheets[sheetName].type});
                    this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 已下载${(progress*100).toFixed(2)}%`, true)
                    break;
            }

        }).on('DONE', ({projName, sheetName}) => {

            this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 下载完毕`)

            let blob = new Blob(this.sheets[sheetName].blobs);
            let reader = new FileReader();
            this.sheets[sheetName].blobs = undefined;

            reader.onload = (e) => {
                this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 正在解析JSON`, true);
                let data = JSON.parse(e.target.result);
                this.sheets[sheetName].data = data;
                this.sheets[sheetName].status = 'ready';
                this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 解析完毕, 共${this.sheets[sheetName].data.length}行数据`, true);

                this.proceedExecuteProcedure();
            }
            reader.onprogress = (e) => {
                this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 已读取${(e.loaded/e.total*100).toFixed(2)}%`, true);
            }
            reader.readAsText(blob);

        }).on("SAVED", () => {
            console.log('receipt.')
        })

    }

    log = (newLog, replace=false) => {
        let logs = this.state.logs.slice(0, replace ? -1 : undefined).concat(newLog);
        this.setState({logs})
    }

    clearCurrentProject = (e) => {
        this.sheets = {};
        console.log('clearing')
        this.setState({
            currProjectName: undefined,
            currSheet: undefined,
            currPath: []
        })
    }

    setRecordPath = (currRecordPath) => {
        console.log('setPath', currRecordPath)
        this.setState({currRecordPath});
    }

    // when calling this function, we have process the table data with exportProc.
    // thus save would receive the data in plain Array & Object form.
    save = (data) => {
        let {currProjectName, currSheet, currType} = this.state;

        console.log(data, 'to be saved');

        this.socket.emit('SAVE', {
            project: currProjectName,
            sheet: currSheet,
            type: currType,
            data
        })
    }

    initTable = ({projName, sheetName, sheetSpec}) => {

        // called by selectSheet from ProjectManager.

        // initTable checks if the dependency is satisfied. If the required data
        // is not retrieved yet, then send request to server.

        if(this.sheets[sheetName] && this.sheets[sheetName].status === 'ready'){

            let {type, desc} = sheetSpec;

            this.log(`表 ${desc} 已经就绪，直接切换`);
            this.setState({
                currProjectName: projName,
                currSheet: sheetName,
                currType: type
            })

        } else {

            let {referred, desc} = sheetSpec;

            this.log(`准备获取 [${desc}]，检查引用的数据是否存在。`);

            if(referred === undefined){
                this.log(`${desc} 里referred表未定义`)
            }

            // check if there is any local table that not defined.
            // if there is, stop, otherwise proceed.

            for (let sheet in referred){
                if(!(sheet in this.sheets) && referred[sheet] === 'local'){
                    this.log(`${desc} 所依赖的本地表 ${sheet} 并不存在，需要先获取上一层依赖关系的表` );
                    return;
                }
            }    

            // retrieve the remote tables.

            for (let sheet in referred){
                this.log(`${referred[sheet].location === 'remote' ? '远程' : '本地'}表 ${referred[sheet].desc}，${sheet in this.sheets ? '存在' : '不存在'}`);
                if(!(sheet in this.sheets) && referred[sheet].location === 'remote'){
                    let {type, desc} = referred[sheet];
                    this.sheets[sheet] = {status: 'pending', desc, type};
                    this.socket.emit('START', {projName, sheetName: sheet, type})
                }
            }
    
            // temp stores current table that waiting for remote tables.
            // Notice that temp only stores one single table, because there could 
            // be only one table to wait.

            this.temp = {projName, sheetName, sheetSpec};
        }
    }

    proceedExecuteProcedure = () => {

        for (let sheet in this.sheets){
            if(this.sheets[sheet].status !== 'ready'){
                this.log(`表 ${sheet}(${this.sheets[sheet].desc}) 尚未就绪，等待下一次检查`);
                return;
            } else {
                this.log(`表 ${sheet}(${this.sheets[sheet].desc}) 已就绪`);
            }
        }

        let {projName, sheetName, sheetSpec} = this.temp,
            {importProc, exportProc, desc, type='DATA'} = sheetSpec;

        this.sheets[sheetName] = {status: 'ready', importProc, exportProc, desc, type, ...importProc(this.sheets)};

        this.setState({
            currProjectName: projName,
            currSheet: sheetName,
            currType: type
        })
    }

    render(){

        let logs = this.state.logs.map((log, index) => <div key={index}>{log}</div>)

        let displayedContent = <Log>{logs}</Log>;
        if(this.state.currSheet !== undefined){

            let sheetName = this.state.currSheet,
                sheet = this.sheets[sheetName];

            // console.log(sheet.data.constructor === List, 'bookmanager');

            displayedContent = <WorkAreaContainer><Formwell
                saveRemote={this.save} {...sheet}
            /></WorkAreaContainer>;
        }

        return (<FlexBox>
            <ProjectManager socket={this.socket} initTable={this.initTable} clearCurrentProject={this.clearCurrentProject}/>
            {displayedContent}
        </FlexBox>)

    }
}