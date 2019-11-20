import React from 'react';
import io from 'socket.io-client';

import Formwell from './Forms';
import Navigation from './Navigation';

import getFinancialTables from './FinancialTables';
import {SheetCollection} from 'persisted';

import { saveAs } from 'file-saver';

const loggerStyle = {    
    whiteSpace: 'pre-wrap',
    margin: '10px',
    fontSize: '80%',
    lineHeight: '2em',
    height: '250px',
}

const wrapper = {
    display: 'flex',
    width: '100%',
    height: '100vh',
}

export default class BookManagerComp extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            logs: [],
            currProjectName: undefined,
            currSheet: undefined,
        }

        this.socket = io(`${props.address}/TABLES`)
        .on('ERROR', ({msg}) =>{
            this.log(msg);
        })
        .on('connect_error', (error) => {
            this.log('与服务器的连接貌似断开了');
        });
        
        let id = localStorage.getItem('user_id')

        this.sheetColl = new SheetCollection(this.socket, id, this.log);
        this.sheetColl.addSheets(getFinancialTables());
    }

    log = (newdiv, replace=false) => {
        let logs = this.state.logs.slice(0, replace ? -1 : undefined).concat(newdiv);
        this.setState({logs})
    }

    clearCurrentProject = (e) => {
        this.sheetColl.clearSheets();
        this.sheetColl.addSheets(getFinancialTables())
        this.log('当前项目数据已清空。');
        this.setState({
            currProjectName: undefined,
            currSheet: undefined,
        })
    }

    fetchTable = ({projName, sheetName}) => {

        this.log(`准备获取 [${projName}] 的 [${sheetName}]`)
        this.sheetColl.fetchTable({
            projName,
            sheetName,
            afterFetched: (isFetched) => {
                this.setState({
                    currProjectName: projName,
                    currSheet: isFetched ? sheetName : undefined
                })
            }
        })
    }

    // save接受的是从exportFunc返回的用于在服务器端保存的数据。具体的返回值需要参考
    // FinancialTables中各文件的exportFunc是如何实现的。
    save = (data) => {
        let {currProjectName, currSheet} = this.state;
        let sheet = this.sheetColl.get(currSheet);

        this.socket.emit('SAVE', {
            projName: currProjectName,
            sheetName: currSheet,
            type: sheet.type,
            data
        }).on('SAVED', () => {
            this.log('已保存')
        })
    }

    export = (data) => {
        let {currProjectName, currSheet} = this.state;
        let sheet = this.sheetColl.get(currSheet);

        this.socket.emit('EXPORT', {
            projName: currProjectName,
            sheetName: currSheet,
            type: sheet.type,
            data
        })
        .on('EXPORTED', ({outputArrayBuffed, projName, sheetName}) => {
            saveAs(new Blob([outputArrayBuffed],{type:"application/octet-stream"}), `导出-${projName}-${sheetName}.xlsx`);
            this.log('已导出')
        })
    }


    render(){

        let {address} = this.props;

        let logs = this.state.logs.map((log, index) => <div key={index}>{log}</div>)

        let displayedContent = <div style={loggerStyle}>{logs}</div>;

        let formwell;
        if(this.state.currSheet !== undefined){

            let sheetName = this.state.currSheet,
                {desc, tables, exportProc, isSavable, isExportable} = this.sheetColl.get(sheetName);

            formwell = <Formwell
                key={sheetName}
                desc={desc}
                sheetName={sheetName}
                tables={tables}

                isExportable={isExportable}
                isSavable={isSavable}
                exportProc={exportProc}
                saveRemote={this.save}
                exportRemote={this.export}
            />;
        }

        let navigation = <Navigation
            sheetColl={this.sheetColl}
            address={address}
            fetchTable={this.fetchTable}
            clearCurrentProject={this.clearCurrentProject}
        />

        return (<div style={wrapper}>
            {navigation}    
            {formwell}
        </div>)

    }
}