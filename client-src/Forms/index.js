import React from 'react';
import Tabs from './Group/Tabs'
import {Table, Button} from 'reactstrap';

const tableStyle = {
    width: '750px',
    paddingBottom: '50px',
    boxSizing: 'border-box',
    borderCollapse: 'collapse',
    position: 'relative',
}

const button = {
    textAlign: 'center',
    float: 'left',
    width: '150px',
    margin: '5px',
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid black',
    cursor: 'pointer',
}

const title = {
    fontSize: '200%',
    fontWeight: 'black',
}

const containerStyle = {
    flexGrow: '1.5',
    fontSize: '87.5%',
    margin: '10px',
}

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

        let {desc, tables, isSavable=false, isExportable=false, sheetName, saveRemote, exportRemote, exportProc} = this.props;

        let save = () => {
            saveRemote(exportProc(tables));
        };

        let reset = () => {
            alert('还没实现，赶紧催催程序员');
        };

        let exportDocument = () => {

            exportRemote(exportProc(tables));

        };

        let rowswiseExport = (rows) => {
            exportRemote(rows.map(e => {
                let newCols = {};
                for (let key in e.head){
                    newCols[e.head[key].colDesc] = e.cols[key];
                }
                return newCols;
            }));
            // console.log(rows, 'rowsewiseExport')
        }

        let supportedTableTypes = {
            Table: '',
            WorkTable: ''
        }

        let tab;
        if(Array.isArray(tables)){
            tab = [];
            for (let i = 0; i < tables.length; i++){
                let table = tables[i];
                if (table.constructor.name in supportedTableTypes){
                    tab.push(<Table borderless style={tableStyle} key={`${sheetName}${i}`}><tbody>
                        <Tabs table={table} rowswiseExport={rowswiseExport} />
                    </tbody></Table>)
                }
            }

        } else if (tables.constructor.name in supportedTableTypes){
            tab = <Table style={tableStyle} key={`${sheetName}`}><tbody>
                <Tabs table={tables} rowswiseExport={rowswiseExport}/>
            </tbody></Table>

        } else {
            return <div>
                遇到了无法形容的数据格式。如果您看到这个信息请召唤程序员。
                <pre style={{height: '400px', overflowY: 'scroll'}}>
                    {JSON.stringify(tables, null, 2)}    
                </pre>
            </div>
        }

        let saveUtils = [],
            buttonStyle = {width: '200px', margin: '5px 10px'};
        if (isSavable){
            saveUtils.push(<Button color="primary" style={buttonStyle} key={0} onClick={save}>保存</Button>)
        }

        if(isExportable){
            saveUtils.push(<Button color="warning" style={buttonStyle} key={2} onClick={exportDocument}>导出</Button>)
        }

        return <div style={containerStyle}>
            <div style={title}>{desc}</div>
            <div className="table-wrapper">{tab}</div>
            {saveUtils}
        </div>
    }
}