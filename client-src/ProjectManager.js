
/**
 * ProjectManager
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
 * 在选择和打开数据表之后（selectSheet方法），ProjectManager就不再更新自
 * 己的状态了，而是通过一个callback来调用BookManager的方法从远程获取数据。
 * 此处的实现详见BookManager的代码。
 * 
 */

import React from 'react';
import styled from 'styled-components';

import UploadBackup from './UploadBackup';
import RestoreBackup from './RestoreBackup';

import ProceduralSheets from './ProceduralSheets/index';

const Container = styled.div`
    width: 250px;
    margin-top: 10px;
`

const ProjItem = styled.div`
    list-style:none;
    border-radius: 5px;
    border 1px solid #E7E7E7;
    background: #F0F0F0;
    padding:10px;
    margin-bottom: 10px;

    &:hover{
        background-color: #F0F0F0;
    }

    &:active{
        background-color: #AEAEAE;
    }
`

const Title = styled.div`
    font-weight: bold;
    margin: 10px 0px;
`

const Note = styled.div`
    font-size: 80%;
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

const BackButton = styled.button`
    display: block;
    font-weight: bold;
    width: 100%;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 15px 15px 0px 0px;
    padding: 5px;
`

function handleRawList(rawList){

    let dict = {};

    rawList.map((e) => {
        return e.split('.')
    }).forEach(([name, type]) => {
        if (type === 'BAK'){
            dict[name] = {projName:name, projStat: 'no-restored'}
        } else if (type === 'RESTORED'){
            dict[name].projStat = 'restored';
        }
    });

    return Object.values(dict);
}

export default class ProjectManager extends React.Component {

    constructor(props, context){
        super(props, context);

        this.state = {
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
        });

        socket.emit('REQUIRE_LIST', {});
    }

    selectProject(index){

        let sheetList = Object.entries(ProceduralSheets).map(
            ([k, v]) => ({sheetName: k, ...v})
        )

        console.log(sheetList);

        this.setState({
            proj: {...this.state.projList[index], sheetList}
        });
    }

    selectSheet = (e) => {
        
        let {initTable} = this.props;
        
        let index = e.target.dataset.key,
            {proj} = this.state,
            {projName} = proj,
            {sheetName, desc, type, head, referred, proc, saveProc} = this.state.proj.sheetList[index];
        
        initTable({projName, sheetName, desc, type, head, referred, proc, saveProc});
    }

    backToList = (e) => {
        this.setState({proj: undefined});
    }

    render(){

        let {socket, clearCurrentProject} = this.props;

        let {projList, proj} = this.state;

        let projElems = projList.map((e, i) => {
            return <ProjItem key={`project-${i}`} onClick={(e) => this.selectProject(i)}>
                {e.projName.split('-')[0]}
            </ProjItem>
        })
        projElems.push(<UploadBackup key='upload' socket={socket}/>)

        let displayed = projElems;
        if(proj !== undefined){

            let name = proj.projName;

            let elemDisplay = ''
            if (proj.projStat !== 'restored'){
                elemDisplay = <RestoreBackup path={name} socket={socket}/> 
            } else {
                elemDisplay = proj.sheetList.map(({desc, progress, status}, index) =>{
                    return <Button key={index} data-key={index} onClick={this.selectSheet}>
                        <div>{desc}</div>
                    </Button>
                })
            }

            displayed = <ProjItem>
                <Title>{name.split('-')[0]}</Title>
                {elemDisplay}
                <BackButton onClick={(e) => {
                    e.stopPropagation()
                    this.backToList();
                    clearCurrentProject();
                }}>返回</BackButton>
            </ProjItem>
        }

        return <Container>
            {displayed}
        </Container>
    }

}