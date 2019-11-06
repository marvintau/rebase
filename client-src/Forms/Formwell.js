import React from 'react';
import Tabs from './Group/Tabs'
import styled from 'styled-components';

const Table = styled.table`
    width: 750px;
    padding-bottom: 50px;
    box-sizing:border-box;
    border-collapse: collapse;
    position: relative;
`

const TableWrapper = styled.div`
    height: 90vh;
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

/**
 * Formwell组件
 * ============
 * Formwell组件是表单区域的根本结构，也是当前表单结构的代称。
 * 
 * Formwell组件本身是一个无状态的结构，它的子组件包含一个<table>列表和若干<button>
 * 其中<table>列表是渲染的主要列表，而<button>则实现了保存/重置等的交互。
 * 
 * Formwell应当对传入的表格数据进行判断，即tables。tables可能是一个包含data, head
 * 两个属性的Object，也可能是一个List。在未来传入Formwell的可能是更复杂的数据结构。作
 * 为传入数据的入口，Formwell应该做好准确判断的工作。
 */

export default class Formwell extends React.Component {

    render () {

        let {tables, isSavable=false, isExportable=false, sheetName, saveRemote, exportRemote, exportProc} = this.props;

        let save = () => {
            saveRemote(exportProc(tables));
        };

        let reset = () => {
            alert('还没实现，赶紧催催程序员');
        };

        let exportDocument = () => {

            exportRemote(exportProc(tables));

        };

        let tab;
        if(Array.isArray(tables)){
            tab = [];
            for (let i = 0; i < tables.length; i++){
                let tabSpec = tables[i];
                if (('head' in tabSpec) && ('data' in tabSpec)){
                    tab.push(<Table key={`${sheetName}${i}`}><tbody><Tabs {...tabSpec} /></tbody></Table>)
                }
            }

        } else if (tables.constructor.name === 'Table'){
            tab = <Table key={`${sheetName}`}><tbody><Tabs {...tables} /></tbody></Table>

        } else {
            return <div>
                遇到了无法形容的数据格式。如果您看到这个信息请召唤程序员。
                <pre style={{height: '400px', overflowY: 'scroll'}}>
                    {JSON.stringify(tables, null, 2)}    
                </pre>
            </div>
        }

        let saveUtils = [];
        if (isSavable){
            saveUtils = [       
                <SaveButton key={0} onClick={save}>保存</SaveButton>,
            ]
        }

        if(isExportable){
            saveUtils.push(<SaveButton key={2} onClick={exportDocument}>导出</SaveButton>)
        }

        return <div>
        <TableWrapper>
            {tab}
        </TableWrapper>
            {saveUtils}
        </div>
    }
}