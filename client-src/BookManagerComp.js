import React from 'react';
import styled from 'styled-components';

import ProjectManager from './ProjectManager';
import SheetComp from './BookComponent/SheetComp';

import Sheet from './Booking/Sheet';

import {address} from './Config.js';

import io from 'socket.io-client';

const Log = styled.div`
    margin: 10px;
    font-size: 80%;
    line-height: 2em;
    height: 250px;
`

const WorkAreaContainer = styled.div`
    width: 1000px;
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

        this.data = {};

        this.socket = io(`http://${address}/TABLES`);

        this.socket.on('TRANS', ({progress, type, data, projName, sheetName})=>{

            switch(type){
                case 'FIRST':
                    this.data[sheetName].blobs = [];
                    this.socket.emit('READY', {projName, sheetName, type: this.data[sheetName].type});
                    break;
                case 'REST':
                    this.data[sheetName].blobs.push(data);
                    this.socket.emit('READY', {projName, sheetName, type: this.data[sheetName].type});
                    this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 已下载${(progress*100).toFixed(2)}%`, true)
                    break;
            }

        }).on('DONE', ({projName, sheetName}) => {

            this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 下载完毕`)

            let blob = new Blob(this.data[sheetName].blobs);
            let reader = new FileReader();
            this.data[sheetName].blobs = undefined;

            reader.onload = (e) => {
                this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 正在解析JSON`, true);
                let data = JSON.parse(e.target.result);
                this.data[sheetName].sheet = new Sheet(data, {});
                this.data[sheetName].status = 'ready';
                this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 解析完毕, 共${this.data[sheetName].sheet.data.length}行数据`, true);

                this.proceedExecuteProcedure();
            }
            reader.onprogress = (e) => {
                this.log(`${projName.split('-')[0]} 项目 ${sheetName} 表: 已读取${(e.loaded/e.total*100).toFixed(2)}%`, true);
                // this.notify(projectName, sheetNameName, {progress: e.loaded/e.total, status: 'PARSING'})
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
        this.data = {};
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

    save = (table) => {
        let {currProjectName, currSheet} = this.state;
        let savedDataForm = table.toSavedForm();
        this.socket.emit('SAVE', {
            project: currProjectName,
            sheet: `saved${currSheet}`,
            data: savedDataForm,
            type: table.type
        })
    }

    initTable = ({projName, sheetName, desc, type, head, referred, proc, saveProc}) => {

        if(this.data[sheetName] && this.data[sheetName].status === 'ready'){
            this.log(`表 ${sheetName} 已经就绪，直接切换`);
            this.setState({
                currProjectName: projName,
                currSheet: sheetName,
                currType: type
            })
        }

        this.log(`准备获取 [${desc}]，检查引用的数据是否存在。`);

        if(referred === undefined){
            this.log(`${desc} 里就没写refer了谁，赶紧查一下代码吧`)
        }

        for (let sheet in referred){
            if(!(sheet in this.data) && referred[sheet] === 'local'){
                this.log(`${desc} 所依赖的本地表 ${sheet} 并不存在，需要先获取上一层依赖关系的表` );
                return;
            }
        }

        for (let sheet in referred){
            this.log(`${referred[sheet].location === 'remote' ? '远程' : '本地'}表 ${referred[sheet].desc}，${sheet in this.data ? '存在' : '不存在'}`);
            if(!(sheet in this.data) && referred[sheet].location === 'remote'){
                let {type, desc} = referred[sheet];
                this.data[sheet] = {status: 'pending', desc, type};
                this.socket.emit('START', {projName, sheetName: sheet, type})
            }
        }

        this.proceeding = {projName, sheetName, desc, head, type, proc, saveProc};
    }

    proceedExecuteProcedure = () => {

        for (let sheet in this.data){
            if(this.data[sheet].status !== 'ready'){
                this.log(`表 ${sheet}(${this.data[sheet].desc}) 尚未就绪，等待下一次检查`);
                return;
            } else {
                this.log(`表 ${sheet}(${this.data[sheet].desc}) 已就绪`);
            }
        }

        let {projName, sheetName, desc, head, type, proc, saveProc} = this.proceeding;
        console.log(this.data, desc, type, 'before creating sheet');
        this.data[sheetName] = {status: 'ready', sheet: new Sheet(this.data, {proc, saveProc, head, desc, type: type ? type : 'DATA'})};

        this.setState({
            currProjectName: projName,
            currSheet: sheetName,
            currType: type
        })
    }

    render(){

        let statusDict = {
            'NONE': '',
            'FIRST': '开始下载',
            'REST': '正在下载',
            'PARSING': '正在读取',
            'PARSED': '读取完毕',
            'LOCAL': '本地'
        }

        let logs = this.state.logs.map((log, index) => <div key={index}>{log}</div>)

        let displayedContent = <Log>{logs}</Log>;
        if(this.state.currSheet !== undefined){

            let sheetName = this.state.currSheet,
                {sheet} = this.data[sheetName];

            displayedContent = <WorkAreaContainer><SheetComp
                table={sheet}
                pageSize={20}
                currPath={this.state.currRecordPath}
                setRecordPath={this.setRecordPath}
                save={this.save}
            /></WorkAreaContainer>;
        }

        return (<FlexBox>
            <ProjectManager socket={this.socket} initTable={this.initTable} clearCurrentProject={this.clearCurrentProject}/>
            {displayedContent}
        </FlexBox>)

    }
}