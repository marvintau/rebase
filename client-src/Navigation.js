
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
import {Col, Badge, Button, Row} from 'reactstrap';

import UploadManager from './UploadManager';
import RestoreBackup from './RestoreBackup';

const ItemButton = ({color, click, text, dataKey}) => {

    let buttonStyle = {
        margin: '5px',
        width: '90%',
        display: 'block',
        TextAlign: 'left',
    }
    return <Row><Button outline={color!=='warning'} style={buttonStyle} color={color} onClick={click} data-key={dataKey}>{text}</Button></Row>
}

const SideBar = ({children}) => {
    return <Col xs="2" style={{background: '#FAFAFA'}}>
        <Row style={{height: '20px'}} />
        {children}
    </Col>
}

const Container = styled.div`
    width: 250px;
    background: #EEEEEE;
    padding: 8px;
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

        let id = localStorage.getItem('user_id');
        console.log(id, 'before require list')
        socket.on('LIST', ({list}) => {
            let projList = list.map(e => ({projName: e}));
            console.log(projList);
            this.setState({
                projList,
                navPos: 'start'
            });
        })
        .emit('REQUIRE_LIST', {id});
    }

    selectProject(index){

        console.log('selected', this.state.projList[index]);
        this.setState({
            navPos: 'sheets',
            proj: {...this.state.projList[index]}
        });
    }

    selectSheet = (e) => {
        
        e.preventDefault();
        e.stopPropagation();

        let {fetchTable} = this.props;

        let sheetName = e.target.dataset.key,
            {projName} = this.state.proj;

        console.log(projName, sheetName, 'selectSheet');
        fetchTable({projName, sheetName});
    }

    backToList = (e) => {
        this.setState({proj: undefined});
    }

    goto = (navPos) => {
        let id = localStorage.getItem('user_id')
        if(navPos === 'start'){
            this.props.sheetColl.socket.emit('REQUIRE_LIST', {id});
        }
        this.setState({navPos})
    }

    logout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_nickname');
        location.reload(true);
    }

    render(){

        let {sheetColl, address, clearCurrentProject} = this.props,
            {socket, sheets:sheetList} = sheetColl;

        let nickname = localStorage.getItem('user_nickname');

        let {navPos} = this.state;

        if (navPos === 'start'){
            return <SideBar>
                <Row><h4><Badge style={{margin: '0px 5px'}} color="secondary">{nickname}</Badge></h4></Row>
                <ItemButton color="primary" click={() => this.goto('open')} text="打开现有项目" />
                <ItemButton color="primary" click={() => this.goto('create')} text="创建新的项目" />
                <ItemButton color="warning" click={() => this.logout()} text="登出" />
            </SideBar>
        }

        if (navPos === 'open'){
            let {projList} = this.state;

            let projElems = projList.map((e, i) => {
                return <ItemButton 
                    key={`project-${i}`}
                    click={(e) => this.selectProject(i)}
                    text={e.projName}
                />
            })
    
            projElems.push(<ItemButton
                key={'back'}
                color="warning"
                click={() => this.goto('start')}
                text="返回"
            />)

            return <SideBar>
                {projElems}
            </SideBar>
        }

        if(navPos === 'create'){
            return <SideBar>
                <UploadManager key='create' socket={socket} address={address}/>
                <ItemButton color="warning" click={() => this.goto('start')} text="返回" />
            </SideBar>
        }

        if(navPos === 'upload'){
            let {projName} = this.state.proj;
            return <SideBar>
                <UploadManager key='upload' projName={projName} socket={socket} address={address}/>
                <ItemButton color="warning" click={() => this.goto('sheets')} text="返回" />
            </SideBar>
        }

        if(navPos === 'delete'){
            let {projName} = this.state.proj
            return <SideBar>
                <UploadManager projName={projName} toDelete={true} key='delete' socket={socket} address={address}/>
                <ItemButton click={() => this.goto('start')} text="返回" />
            </SideBar>
        }

        if (navPos === 'sheets'){
            let elemDisplay = [];
            for (let sheetName in sheetList){
                let {desc, location} = sheetList[sheetName];
                if (location === 'local'){
                    elemDisplay.push(<ItemButton
                        key={sheetName}
                        dataKey={sheetName}
                        click={this.selectSheet}
                        text={desc}
                    />)
                }
            }

            return <SideBar>
                <h3 style={{letterSpacing: '-1px'}}>{this.state.proj.projName}</h3>
                {elemDisplay}
                <Note>点击以下按钮来上传和追加新的数据。</Note>
                <ItemButton color="primary" click={(e) => {this.goto('upload');}} text="上传数据" />
                <Note>只要上传了新的数据，都要回来点一下这里更新。需要注意的是，如果您在更新之前有存档，更新之后的存档都会被清零。所以对于一些配置性的数据表，请在更新之前导出备份。</Note>
                <ItemButton color="primary" click={(e) => {this.goto('restore');}} text="更新数据" />
                <ItemButton color="danger" click={(e) => {this.goto('delete');}} text="删除项目" />
                <ItemButton color="warning" click={(e) => {clearCurrentProject();this.goto('start');}} text="返回" />
            </SideBar>
        }

        if (navPos === 'restore'){

            let {projName, path} = this.state.proj;
            console.log(projName, path, 'restoring');
            return <SideBar>
                <RestoreBackup path={path} projName={projName} socket={socket} goto={this.goto} />
                <ItemButton color="warning" click={(e) => {this.goto('sheets');}} text="返回" />
            </SideBar>
        }

    }

}