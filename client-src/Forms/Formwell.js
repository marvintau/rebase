import React from 'react';
import Tabs from './Group/Tabs'
import styled from 'styled-components';

const Table = styled.table`
    min-width: 600px;
    width: auto;
    box-sizing:border-box;
    border-collapse: collapse;
    position: relative;
`

const TableWrapper = styled.div`
    height: 100vh;
    width: auto;
    box-sizing:border-box;
    overflow-y: scroll !important;
`

const SaveButton = styled.div`
    text-align: center;
    float: left;
    width: 150px;
    margin: 5px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid black;
    
    &:hover {
        cursor: pointer;
        background-color: #D8D8D8;
    }

    &: active {
        background-color: #8D8D8D;
    }
`

export default function Formwell ({saveRemote, sections, exportProc, isSavable=false}) {

    let save = () => {
        saveRemote(exportProc(sections));
    }

    let reset = () => {

    }

    console.log(sections, 'formwell');

    let tab;
    if(Array.isArray(sections)){
        tab = [];
        for (let i = 0; i < sections.length; i++){
            let tabSpec = sections[i];
            if (('head' in tabSpec) && ('data' in tabSpec)){
                tab.push(<Table key={i}><tbody><Tabs {...tabSpec} /></tbody></Table>)
            }
        }
    } else if (('head' in sections) && ('data' in sections)){
        tab = <Table><tbody><Tabs {...sections} /></tbody></Table>
    } else {
        return <div>
            收到了解释不了的数据格式。如果您看到这个信息请联系开发人员。
            <pre style={{height: '400px', overflowY: 'scroll'}}>
                {JSON.stringify(sections, null, 2)}    
            </pre>
        </div>
    }

    let saveUtils = [];
    if (isSavable){
        saveUtils = [       
            <SaveButton key={0} onClick={save}>保存</SaveButton>,
            <SaveButton key={1} onClick={reset}>重置</SaveButton>
        ]
    }

    return <TableWrapper>
        {tab}
        {saveUtils}
    </TableWrapper>
}