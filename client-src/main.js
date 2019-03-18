import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import React, {Component} from "react";
import {render} from "react-dom";

import BodyCell from "./Ledgitable/body-cell.js";

window.React = React;

let randomChoice = (array) => {
    let rand = Math.floor(Math.random()*array.length);
    return array[rand];
}

let randomName = () => {
    let starting = ['c', 'ch', 'cl', 'cr', 'dr', 'fr', 'gr', 'sh', 'qu', 'wh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'r', 'g', 'h', 'k', 's', 'v', 'w'],
        consonants = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'r', 'g', 'h', 'k', 's', 'v', 'w', "dg", "ph", 'gh'],
        vowels = ['a', 'e', 'i', 'o', 'u', 'ai', 'ei', 'ou'],
        ending = ['er', 'ct', 'ck', 'st', "m", "n", "ght", 'll', 'ynn'];

    let name = randomChoice(starting) + randomChoice(vowels),
        len = Math.floor(Math.random()*3);
    for (let i = 0; i < len; i++){
        name += randomChoice(consonants) + randomChoice(vowels);
    }
    
    name += randomChoice(ending);
    return name;
}

let randomType = () => {
    return randomChoice(['int', 'tinyint', 'smallint', 'float', 'money', 'undefined', 'datetime', 'nvarchar', 'varchar', 'bit']);
}

let toRecord = (vals, fields) => {
    let res = {}
    for(let i = 0; i < fields.length; i++){
        res[fields[i]] = vals[i];
    }
    return res;
}

let cols = 20,
    rows = 20;

let head = Array(cols).fill(0).map(e => randomName());
let tableData = {
    name: "testable",
    columnAttr: toRecord(Array(cols).fill(0).map(e=>({type: randomType(), default: 0})), head),
    data: Array(rows).fill(0).map(e=>toRecord(Array(cols).fill(0).map(e=>Math.random()), head))
}
console.log(tableData);

class BodyRow extends Component {

    render() {
        const {row, cells, updateCell, columnAttr, insertRecord, removeRecord} = this.props;

        let insertRec = (e) => { insertRecord(row);},
            removeRec = (e) => { removeRecord(row);};

        const editButton = (<td className="edit-bar">
            <button className="btn-sm btn-modify btn-outline-primary" onClick={insertRec} >插入</button>
            <button className="btn-sm btn-modify btn-outline-danger"  onClick={removeRec}>删除</button>
        </td>)

        const cellElems = cells.map((cell, i) => (<BodyCell data={cell} key={i} row={row} col={i} updateCell={updateCell} type={columnAttr[i].attr.type}/>));
        return (<tr>{editButton}{cellElems}</tr>);
    }
}

class HeadCell extends Component {
    
    render() {

        const {data, type} = this.props;

        return (<th type={type} className={"th-header "+type}>{data}</th>);
    }
}

class HeadRow extends Component {

    render() {
        const {cols} = this.props;
        console.log(cols);
        const colElems = cols.map((col, i) => (<HeadCell {...col} key={i}/>));
        return (<tr>
            <HeadCell data="编辑" className="edit-bar"/>
            {colElems
        }</tr>);
    }
}

class TableBody extends Component {
    render(){
        const {rows, ...rest} = this.props;
        const rowElems = rows.map((cells, i) => (
            <BodyRow cells={cells} key={i} row={i} {...rest}/>
        ));
        return (<tbody>{rowElems}</tbody>);
    }
}

class TableHead extends Component {
    render(){
        const {name, row, updateCell} = this.props;
        return (<thead><HeadRow cols={row} /></thead>);
    }
}

class LedgerTable extends Component {

    constructor(props, context){
        super(props, context);
        this.state = {
            head : Object.keys(props.data[0]).map(key => ({data: key, attr:props.columnAttr[key]})),
            body : props.data.map(record => Object.values(record))
        }
        this.updateCell = this.updateCell.bind(this);
        this.insertRecord = this.insertRecord.bind(this);
        this.removeRecord = this.removeRecord.bind(this);
    }

    insertRecord(row){
        let body = this.state.body;
        // console.log(this.state.head, "insert");
        body.splice(row+1, 0, this.state.head.map(e=>e.attr.default));
        this.setState({body: body});
    }

    removeRecord(row){
        let body = this.state.body;
        body.splice(row, 1);
        this.setState({body: body});
    }

    updateCell(row, col, data){
        let body = this.state.body;
        body[row][col].data = data;
        this.setState({body: body});
    }

    render() {
        const {name} = this.props;

        let tableID = `table-${name}`;

        return(
        <div id={tableID} className="table-outer">
        <table>
            <TableHead name={name} row={this.state.head} />
            <TableBody
                name={name}
                rows={this.state.body}
                columnAttr={this.state.head}
                updateCell={this.updateCell}
                insertRecord={this.insertRecord}
                removeRecord={this.removeRecord}
                />
        </table></div>);
    }

}
render(<LedgerTable {...tableData} />, document.getElementById("container"));


// let createTable = function (tableType, tableID, tableName, tableDisplayName) {
    
//     if(tableID in tables){

//         let tableArea = document.getElementById('table-area'),
//             colTypeDict = tables['SYS_RPT_ItmDEF'][tableID];

//         tables[tableID] = new tableType(tables[tableID], colTypeDict, typeDefault, tableName);
//         tables[tableID].render(tableDisplayName, tableArea);

//     }

// }

// let applyCategoryCode = function(tableID){
//     let vouchers = tables[tableID],
//         ccodes = tables['SYS_code'];
//     for (let i = 0; i < vouchers.length; i++){
//         let ccode = tables[tableID][i].ccode,
//             ccodeEntry = tables['SYS_code'][ccode];
    
//         let name = "";
//         for (let l = ccode.length; l >= 4; l -=2 ){
//             name = ccodes[ccode.slice(0, l)].ccode_name + ":" + name;
//         }
//         name = name.slice(0, -1);

//         tables[tableID][i].ccode = `${ccode}-${ccodeEntry.cclass}-${name}`;
//     }
// }

var socket = io.connect(),
    tables = {};

// Array.prototype.groupBy = function(key) {
//   return this.reduce(function(rv, x) {
//     (rv[x[key]] = rv[x[key]] || []).push(x);
//     return rv;
//   }, {});
// };

// let backupFile = new FileSend(),
//     localFile  = new FileSend();

// backupFile.setStartFunc((instance) =>{
//     socket.emit('start', {
//         name: instance.file.name,
//         size: instance.file.size
//     });
// });

// backupFile.setOnload((event, instance) => {
//     socket.emit('upload', {
//         name: instance.file.name,
//         segment: event.target.result
//     });
// });

// localFile.setOnload((event, instance) => {
    
//     let data = JSON.parse(event.target.result);

//     Object.assign(tables, data);

//     if('SYS_RPT_ItmDEF' in tables){
//         tables['SYS_RPT_ItmDEF'] = tables['SYS_RPT_ItmDEF'].groupBy('TableName');
//         for (let tab in tables['SYS_RPT_ItmDEF']){
//             let dict = {},
//                 arr = tables['SYS_RPT_ItmDEF'][tab];

//             for (let i = 0; i < arr.length; i++){
//                 dict[arr[i].FieldName] = {def: arr[i].FieldDef, type: arr[i].FieldType}
//             }

//             tables['SYS_RPT_ItmDEF'][tab] = dict;
//         }
//     } else throw TypeError('RPT_ItmDEF table is mandatory.')

//     if('SYS_code' in tables){
//         let ccodes = tables['SYS_code'],
//             dict = {};
//         for (let i = 0; i <ccodes.length; i++){
//             let currCode = ccodes[i].ccode;
//             for (let k in ccodes[i]) {
//                 if (ccodes[i][k] === null) delete ccodes[i][k];
//             }
//             dict[currCode] = ccodes[i];
//         }
//         tables['SYS_code'] = dict;
//     } else throw TypeError('ccode table is mandatory.')

//     applyCategoryCode('GL_accvouch');
//     applyCategoryCode('GL_accsum');

//     // console.log(tables['GL_accvouch'][0].ccode);

//     let balance = Object.entries(tables['GL_accsum'].groupBy("ccode")).sort();

//     createTable(Table, 'GL_accvouch', 'vouchers', "凭证明细 Vouchers");
//     createTable(Balance, 'GL_accsum', 'balance', '科目余额 Balances');

// })

// $('#choose-backup-file').on('change', function () {
//     // console.log('here');
//     backupFile.start('choose-backup-file');
// });

// $('#choose-local-file').on('change', function () {
//     localFile.start('choose-local-file');
//     localFile.readAsText();
// });

// $('#dump-data').on('click', function(){
//     FileSaver.saveAs(new Blob([JSON.stringify(tables)], {type: "mime"}), "tables.json");
// })

// var updateIndicator = function(message){
//     document.getElementById('indicator').innerText = message;
// }

// var updateIndicatorErr = function(message){
//     document.getElementById('indicator').innerText += "\n" + message;
// }

// socket.on('more', function (data) { 
//     updateIndicator("已上传 " + data.percent.toFixed(1)+"% 注意请不要这个时候刷新页面");
//     backupFile.readSlice(data.position);
// });

// socket.on('msg', function (data) {
//     switch(data.type){
//         case "UPLOAD_DONE":
//             backupFile.dispose();
//             updateIndicator("上传完成。后台正在复原您刚上传的SQL备份数据，可能要花几分钟。");
//             break;
//         case "RESTORE_DONE":
//             updateIndicator("数据恢复完成，准备显示数据。");
//             break;
//         case "DATA":
//             updateIndicator(`接收到数据表 :[${data.tableName}]`);
//             Object.assign(tables, {[data.tableName]:data.data});
//             break;

//         default :
//             updateIndicatorErr("服务器发来了不知道什么类型的消息，有可能是个bug : ["+ data.type + "]");
//     }
// });