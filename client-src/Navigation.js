
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

const Container = styled.div`
    width: 250px;
    background: #EEEEEE;
    padding: 8px;
`

const Title = styled.div`
    font-weight: bold;
    margin: 10px 0px;
`

const ManuItem = styled.button`
    display:flex;
    justify-content: space-between;
    width: 100%;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 5px 0px;
    padding: 5px;
`

const Note = styled.div`
    margin: 10px 10px;
    letter-spacing: -0.8px;
    font-size: 90%;
`

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

        let {sheetColl} = this.props,
            {socket} = sheetColl;

        socket.on('LIST', ({list}) => {
            let projList = list.map(e => ({projName: e}));
            console.log(projList);
            this.setState({
                projList,
                navPos: 'start'
            });
        })
        .emit('REQUIRE_LIST', {});
    }

    selectProject(index){

        console.log('selected', this.state.projList[index]);
        this.setState({
            navPos: 'sheets',
            proj: {...this.state.projList[index]}
        });
    }

    selectSheet = (e) => {
        
        let {fetchTable} = this.props;

        let sheetName = e.target.dataset.key,
            {projName} = this.state.proj;

        fetchTable({projName, sheetName});
    }

    backToList = (e) => {
        this.setState({proj: undefined});
    }

    goto = (navPos) => {
        if(navPos === 'start'){
            this.props.sheetColl.socket.emit('REQUIRE_LIST', {});
        }
        this.setState({navPos})
    }

    render(){

        let {sheetColl, address, clearCurrentProject} = this.props,
            {socket, sheets:sheetList} = sheetColl;

        let {navPos} = this.state;

        if (navPos === 'start'){
            return <Container>
                <ManuItem onClick={() => this.goto('open')}>打开现有项目</ManuItem>
                <ManuItem onClick={() => this.goto('create')}>创建新的项目</ManuItem>
            </Container>
        }

        if (navPos === 'open'){
            let {projList} = this.state;

            let projElems = projList.map((e, i) => {
                return <ManuItem key={`project-${i}`} onClick={(e) => this.selectProject(i)}>
                    {e.projName}
                </ManuItem>
            })
    
            projElems.push(<ManuItem key={'back'} onClick={() => this.goto('start')}>返回</ManuItem>)

            return <Container>
                {projElems}
            </Container>
        }

        if(navPos === 'create'){
            return <Container>
                <UploadManager key='create' socket={socket} address={address}/>
                <ManuItem onClick={() => this.goto('start')}>返回</ManuItem>
            </Container>
        }

        if(navPos === 'upload'){
            let {projName} = this.state.proj;
            return <Container>
                <UploadManager key='upload' projName={projName} socket={socket} address={address}/>
                <ManuItem onClick={() => this.goto('sheets')}>返回</ManuItem>
            </Container>
        }

        if(navPos === 'delete'){
            let {projName} = this.state.proj
            return <Container>
                <UploadManager projName={projName} toDelete={true} key='delete' socket={socket} address={address}/>
                <ManuItem onClick={() => this.goto('start')}>返回</ManuItem>
            </Container>
        }

        if (navPos === 'sheets'){
            let elemDisplay = [];
            for (let sheetName in sheetList){
                let {desc, location} = sheetList[sheetName];
                if (location === 'local'){
                    elemDisplay.push(<ManuItem key={sheetName} data-key={sheetName} onClick={this.selectSheet}>{desc}</ManuItem>)
                }
            }

            return <Container>
                <Title>{this.state.proj.projName}</Title>
                {elemDisplay}
                <Note>点击以下按钮来上传和追加新的数据。</Note>
                <ManuItem onClick={(e) => {
                    this.goto('upload');
                }}>上传数据</ManuItem>
                <Note>无论何时您上传了新的数据，都要回来点一下这里更新。需要注意的是，如果您在更新之前有存档，更新之后的存档都会被清零。所以对于一些配置性的数据表，请在更新之前导出备份。</Note>
                <ManuItem onClick={(e) => {
                    this.goto('restore');
                }}>更新数据</ManuItem>
                <ManuItem onClick={(e) => {
                    this.goto('delete');
                }}><span style={{color:'red', fontWeight: 'bold'}}>{'删除项目'}</span></ManuItem>
                <ManuItem onClick={(e) => {
                    clearCurrentProject();
                    this.goto('start');
                }}>返回</ManuItem>
            </Container>
        }

        if (navPos === 'restore'){

            let {projName, path} = this.state.proj;
            console.log(projName, path, 'restoring');
            return <Container>
                <RestoreBackup path={path} projName={projName} socket={socket} goto={this.goto} />
                <ManuItem onClick={(e) => {
                    this.goto('sheets');
                }}>返回</ManuItem>
            </Container>
        }

    }

}