import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

// import LedgiTable from './Ledgitable/ledgi-table.js';
// import Balance from "./Ledgable/balance.js";

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

let cols = 10,
    rows = 10;

let tableData = {
    name: "testable",
    columnTypes: Array(cols).fill(0).map(e=>randomType()),
    head: Array(2).fill(0).map(e=> Array(cols).fill(0).map(e => ({data: randomName(), type:"nvarchar"}))),
    body: Array(rows).fill(0).map(e=>Array(cols).fill(0).map(c => {
        return {data: Math.random().toFixed(5), type: "int"}
    }))
}

const typeDefault = {
    "int"      : { default: 0 },
    "tinyint"  : { default: 0 },
    "smallint" : { default: 0 },
    "float"    : { default: 0 },
    "money"    : { default: 0 },
    "undefined": { default: 0 },
    "datetime" : { default: 0 },
    "nvarchar" : { default: "无" },
    "varchar"  : { default: "无" },
    "bit"      : { default: false },
};

class Ledgeable {

    /**
     * Ledgiable ONLY accepts the data in the form of ARRAY OF PLAIN OBJECT.
     * the PLAIN OBJECT is a subset of object, that:
     * 
     * 1) it could be either nested or flat
     * 2) the value of key could be either object or primitive data type.
     * 3) the primitive data type contains only **string**, **number** and **null**
     * 
     * Legdeable contains two types of data, that:
     * 
     * 1) the source data, which is comprehensive. The original data accepts
     *    operations including insertion/deletion/modification.
     * 2) the presented data, which is the final data applied with operations,
     *    including sort, filter and pagination, from the source data.
     * 
     * @param {Array} data Array of plain objects
     * @param {*} columnAttrs 
     */
    constructor(data, columnAttrs){

    }
}

class BodyRow extends Component {

    render() {
        const {row, cells, updateCell, columnTypes} = this.props;
        const cellElems = cells.map((cell, i) => (<BodyCell {...cell} key={i} row={row} col={i} updateCell={updateCell} type={columnTypes[i]}/>));
        return (<tr>{cellElems}</tr>);
    }
}

class HeadCell extends Component {
    
    render() {

        const {data, type} = this.props;

        return (<th type={type} className={type}>{data}</th>);
    }
}

class HeadRow extends Component {

    render() {
        const {cols} = this.props;
        const colElems = cols.map((col, i) => (<HeadCell {...col} key={i}/>));
        return (<tr>{colElems}</tr>);
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
        const {name, rows, updateCell} = this.props;
        const rowElems = rows.map((row, i) => (<HeadRow cols={row} key={i} />));
        return (<thead>{rowElems}</thead>);
    }
}

class LedgiTable extends Component {

    constructor(props, context){
        super(props, context);
        this.state = {body: props.body};

        this.updateCell = this.updateCell.bind(this);
    }

    updateCell(row, col, data){
        let body = this.state.body;
        body[row][col].data = data;
        this.setState({data: body});
    }

    render() {
        const {name, head, columnTypes} = this.props;
        return(<table>
            <TableHead name={name} rows={head} />
            <TableBody name={name} rows={this.state.body} columnTypes={columnTypes} updateCell={this.updateCell}/>
        </table>);
    }

}

console.log(tableData);
render(<LedgiTable {...tableData} />, document.getElementById("container"));


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