
/**
 * Navigation
 * --------------
 * 
 * Accounting for all interactions **BEFORE VIEWING LEDGING DATA**
 *  
 * 1. Selecting Project
 * 
 * 2. **Restore backup file (.BAK) at remote side**
 *    call stored procedure，restore .BAK file, and export them to
 *    transmittable JSON file.
 * 
 * 3. **Retrieve JSON from remote side**
 *    retrieve JSON file specified in sheets.
 * 
 * 4. **Sync up configuration sheet with remote side**
 * 
 * 5. **Update local tables with dependency**
 * 
 * 其中2/3/4项均需要通过socket与服务器进行交互。
 * 
 * 在选择和打开数据表之后（selectSheet方法），Navigation就不再更新自
 * 己的状态了，而是通过一个callback来调用BookManager的方法从远程获取数据。
 * 此处的实现详见BookManager的代码。
 * 
 */

import React from 'react';
import styled from 'styled-components';

import UploadManager from './UploadManager';
import RestoreBackup from './RestoreBackup';

import FinancialTables from './FinancialTables';

const Container = styled.div`
    width: 250px;
    margin-top: 10px;
`

const ManuItem = styled.div`
    list-style:none;
    border-radius: 5px;
    border 1px solid #E7E7E7;
    background: #F0F0F0;
    padding:10px;
    margin-bottom: 10px;
    user-select: none;

    &:hover{
        background-color: #F0F0F0;
        cursor: point;
    }

    &:active{
        background-color: #AEAEAE;
    }
`

const Title = styled.div`
    font-weight: bold;
    margin: 10px 0px;
`

const Button = styled.button`
    display:flex;
    justify-content: space-between;
    width: 100%;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 5px 0px;
    padding: 5px;
`

const BottomButton = styled.button`
    display: block;
    font-weight: bold;
    width: 100%;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 15px 15px 0px 0px;
    padding: 5px;
`

const Note = styled.div`
    margin: 10px 10px;
    letter-spacing: -0.8px;
    font-size: 80%;
`

function handleRawList(rawList){

    let dict = {};

    rawList.map((e) => {
        return e.split('.')
    })
    .filter(e => e.length > 1)
    .forEach((nameList) => {
        // 在这里检查服务器所存储的数据只包含新上传的数据，还是已经包含了经过复原的数据
        let [projStat, projName, ...rest] = nameList,
            currStat = dict[projName] ? dict[projName].projStat : undefined;

        if (projStat === 'RESTORED' || (projStat === 'SOURCE' && currStat === undefined)){
            Object.assign(dict, {[projName]: {projName, projStat}});
        }

    });

    return Object.values(dict);
}

export default class Navigation extends React.Component {

    constructor(props, context){
        super(props, context);

        this.state = {
            navPos: 'start',
            projList : [],
            proj: undefined,
        }

        this.sheetData = {};
    }

    componentDidMount(){

        let {socket} = this.props;

        socket.once('LIST', ({list}) => {
            let projList = handleRawList(list);
            this.setState({projList});
        })
        .emit('REQUIRE_LIST', {});
    }

    selectProject(index){

        let sheetList = Object.assign({}, FinancialTables);

        this.setState({
            navPos: 'sheets',
            proj: {...this.state.projList[index], sheetList}
        });
    }

    selectSheet = (e) => {
        
        let {initTable} = this.props;

        let sheetName = e.target.dataset.key,
            sheetSpec = this.state.proj.sheetList[sheetName],
            {projName} = this.state.proj;

        console.log(e.target, sheetName, sheetSpec, 'before calling initTable')
        initTable({projName, sheetName, sheetSpec});
    }

    backToList = (e) => {
        this.setState({proj: undefined});
    }

    goto = (navPos) => {
        this.setState({navPos})
    }

    render(){

        let {socket, address, clearCurrentProject} = this.props;

        let {navPos} = this.state;

        if (navPos === 'start'){
            return <Container>
                <ManuItem onClick={() => this.goto('open')}>打开现有项目</ManuItem>
                <ManuItem onClick={() => this.goto('upload')}>上传一个新项目</ManuItem>
            </Container>
        }

        if (navPos === 'open'){
            let {projList} = this.state;

            let projElems = projList.map((e, i) => {
                return <ManuItem key={`project-${i}`} onClick={(e) => this.selectProject(i)}>
                    {e.projName.split('-')[0]}
                </ManuItem>
            })
    
            projElems.push(<ManuItem key={'back'} onClick={() => this.goto('start')}>返回</ManuItem>)

            return <Container>
                {projElems}
            </Container>
        }

        if (navPos === 'upload'){
            return <Container>
                <UploadManager key='upload' socket={socket} address={address}/>
                <ManuItem onClick={() => this.goto('start')}>返回</ManuItem>
            </Container>
        }

        if (navPos === 'sheets'){
            let {proj} = this.state;
            let name = proj.projName;

            let elemDisplay = [];
            for (let sheetName in proj.sheetList){
                let {desc} = proj.sheetList[sheetName];
                elemDisplay.push(<Button key={sheetName} data-key={sheetName} onClick={this.selectSheet}>
                    {desc}
                </Button>)
            }

            let displayed = <ManuItem>
                <Title>{name.split('-')[0]}</Title>
                {elemDisplay}
                <Note>如果您首次上传了数据文件，或者在上次更新之后又上传了新的数据文件，您需要在这里更新，转换为系统的内部数据。</Note>
                <BottomButton onClick={(e) => {
                    this.goto('restore');
                }}>更新数据</BottomButton>
                <BottomButton onClick={(e) => {
                    clearCurrentProject();
                    this.goto('start');
                }}>返回</BottomButton>
            </ManuItem>

            return <Container>
                {displayed}
            </Container>
        }

        if (navPos === 'restore'){

            let {projName, path} = this.state.proj;
            console.log(projName, path, 'restoer');
            return <Container>
                <RestoreBackup path={path} name={projName} socket={socket} goto={this.goto} />
            </Container>
        }

    }

}