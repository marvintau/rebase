import React from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';

import Formwell from './Forms/Formwell';
import Navigation from './Navigation';

import getFinancialTables from './FinancialTables';
import {SheetCollection} from 'persisted';

import { saveAs } from 'file-saver';

const Log = styled.div`
    white-space: pre-wrap;
    margin: 10px;
    font-size: 80%;
    line-height: 2em;
    height: 250px;
`

const WorkAreaContainer = styled.div`
    flex-grow: 1.5;
    font-size : 85%;
    margin: 10px;
`

const FlexBox = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100vh;
`

const Title = styled.div`
    font-size: 200%;
    font-weight: black;
`

export default class BookManagerComp extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            logs: [],
            currProjectName: undefined,
            currSheet: undefined,
        }

        this.socket = io(`${props.address}/TABLES`);
        console.log(this.socket);
        this.sheetColl = new SheetCollection(this.socket, this.log);
        this.sheetColl.addSheets(getFinancialTables());
    }

    log = (newLog, replace=false) => {
        let logs = this.state.logs.slice(0, replace ? -1 : undefined).concat(newLog);
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

        console.log(data, 'to be saved');

        this.socket.emit('SAVE', {
            projName: currProjectName,
            sheetName: currSheet,
            type: sheet.type,
            data
        })
    }

    export = (data) => {
        let {currProjectName, currSheet} = this.state;
        let sheet = this.sheetColl.get(currSheet);

        console.log(data, 'to be saved');

        this.socket.emit('EXPORT', {
            projName: currProjectName,
            sheetName: currSheet,
            type: sheet.type,
            data
        })
        .on('EXPORTED', ({outputArrayBuffed, projName, sheetName}) => {
            saveAs(new Blob([outputArrayBuffed],{type:"application/octet-stream"}), `导出-${projName}-${sheetName}.xlsx`);
        })
    }


    render(){

        let {address} = this.props;

        let logs = this.state.logs.map((log, index) => <div key={index}>{log}</div>)

        let displayedContent = <Log>{logs}</Log>;

        if(this.state.currSheet !== undefined){

            let sheetName = this.state.currSheet,
                {desc, tables, exportProc, isSavable, isExportable} = this.sheetColl.get(sheetName);

            displayedContent = <WorkAreaContainer>
                <Title>{desc}</Title>
                <Formwell
                    key={sheetName}
                    sheetName={sheetName}
                    tables={tables}

                    isExportable={isExportable}
                    isSavable={isSavable}
                    exportProc={exportProc}
                    saveRemote={this.save}
                    exportRemote={this.export}
                />
            </WorkAreaContainer>;
        }

        // console.log()

        return (<FlexBox>
            <Navigation
                sheetList={this.sheetColl.sheets}
                address={address}
                socket={this.socket}
                fetchTable={this.fetchTable}
                clearCurrentProject={this.clearCurrentProject}/>
            {displayedContent}
        </FlexBox>)

    }
}