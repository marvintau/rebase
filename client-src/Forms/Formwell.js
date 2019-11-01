import React from 'react';
import Tabs from './Group/Tabs'
import styled from 'styled-components';

import XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
 * Formwell应当对传入的表格数据进行判断，即sections。sections可能是一个包含data, head
 * 两个属性的Object，也可能是一个List。在未来传入Formwell的可能是更复杂的数据结构。作
 * 为传入数据的入口，Formwell应该做好准确判断的工作。
 */

export default class Formwell extends React.Component {

    render () {

        let {sheetName, saveRemote, sections, exportProc, isSavable=false, isExportable=false} = this.props;

        let save = () => {
            saveRemote(exportProc(sections));
        };

        let reset = () => {
            alert('还没实现，赶紧催催程序员');
        };

        let exportDocument = () => {

            let exported = exportProc(sections);

            let xlsSheet = XLSX.utils.json_to_sheet(exported),
                xlsBook = XLSX.utils.book_new();

            xlsBook.SheetNames.push('sheet1');
            xlsBook.Sheets['sheet1'] = xlsSheet;

            let xlsOutput = XLSX.write(xlsBook, {bookType:'xlsx', type: 'binary'});

            function s2ab(s) { 
                var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
                var view = new Uint8Array(buf);  //create uint8array as viewer
                for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
                return buf;    
            }

            let outputArrayBuffed = s2ab(xlsOutput);

            saveAs(new Blob([outputArrayBuffed],{type:"application/octet-stream"}), 'exported.xlsx');
        };

        let tab;
        if(Array.isArray(sections)){
            tab = [];
            for (let i = 0; i < sections.length; i++){
                let tabSpec = sections[i];
                if (('head' in tabSpec) && ('data' in tabSpec)){
                    tab.push(<Table key={`${sheetName}${i}`}><tbody><Tabs {...tabSpec} /></tbody></Table>)
                }
            }
        } else if (('head' in sections) && ('data' in sections)){
            tab = <Table key={`${sheetName}`}><tbody><Tabs {...sections} /></tbody></Table>
        } else {
            return <div>
                遇到了无法形容的数据格式。如果您看到这个信息请联系开发人员。
                <pre style={{height: '400px', overflowY: 'scroll'}}>
                    {JSON.stringify(sections, null, 2)}    
                </pre>
            </div>
        }

        let saveUtils = [];
        if (isSavable){
            saveUtils = [       
                <SaveButton key={0} onClick={save}>保存</SaveButton>,
                <SaveButton key={1} onClick={reset}>重置</SaveButton>,
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