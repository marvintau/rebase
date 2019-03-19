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
    columnAttr: toRecord(Array(cols).fill(0).map(e=>({type: randomType(), default: 0, sorted: "NONE", filter:""})), head),
    data: Array(rows).fill(0).map(e=>toRecord(Array(cols).fill(0).map(e=>Math.random()), head))
}
console.log(tableData);

class BodyRow extends Component {

    render() {
        const {row, cells, updateCell, columnAttr, insertRecord, removeRecord} = this.props;

        let insertRec = (e) => { insertRecord(row);},
            removeRec = (e) => { removeRecord(row);};

        const number =(<td>{row}</td>);
        const editButton = (<td className="edit-bar">
            <button className="btn-sm btn-modify btn-outline-primary" onClick={insertRec} >插入</button>
            <button className="btn-sm btn-modify btn-outline-danger"  onClick={removeRec}>删除</button>
        </td>)

        const cellElems = cells.map((cell, i) => (<BodyCell data={cell} key={i} row={row} col={i} updateCell={updateCell} attr={columnAttr[i].attr}/>));
        return (<tr>{number}{editButton}{cellElems}</tr>);
    }
}

class HeadCell extends Component {
    
    constructor(props, context){
        super(props, context);
        this.state = {filtering: false};
        
        this.setFilter = this.setFilter.bind(this);
    }

    setFilter(){

        this.setState({filtering: !this.state.filtering});
    }

    render() {

        let nextSort = {
            "NONE"       : "▲升序排列",
            "ASCENDING"  : "▼降序排列",
            "DESCENDING" : "▲升序排列"
        }

        const {data, attr, col, columnEditing, sortColumn, filterColumn, toggleFold} = this.props;

        let filterElems = [(<button className="btn-sm btn-modify btn-primary" onClick={(e) =>this.setFilter()} key="0">筛选</button>)];
        if(this.state.filtering){
            filterElems.push(<div  key="1">
                <input autoFocus
                    type="text"
                    className="input"
                    placeholder="按回车键确认"
                    defaultValue={attr.filter}
                    onKeyDown={(e) => {
                        if(e.key=="Enter"){
                            filterColumn(col, e.target.value);
                            this.setState({filtering: false});
                        }
                    }}
                ></input>
            </div>)
        }

        if(attr.fold){
            return (<th type={attr.type} className={"th-header fold "+attr.type} onDoubleClick={(e)=>{toggleFold(col);}}></th>);
        }
        if(!attr.editing)
            return (<th type={attr.type} className={"th-header "+attr.type} onDoubleClick={(e)=>{columnEditing(col);}}>{data}</th>);
        else{
            return (<th type={attr.type} className={"th-header "+attr.type}>
            {data}
            <div>
                <button className="btn-sm btn-modify btn-warning" onClick={(e) => sortColumn(col)}> {nextSort[attr.sorted]} </button>
                <button className="btn-sm btn-modify btn-danger" onClick={(e) => toggleFold(col)}>折叠</button>
                {filterElems}
            </div>
            </th>);
        }
    }
}

class HeadRow extends Component {

    render() {
        const {cols, ...rest} = this.props;

        const colElems = cols.map((col, i) => (
            <HeadCell {...col} key={i} col={i} {...rest}/>
        ));
        return (<tr>
            <HeadCell data="ID" className="edit-bar" attr={({})}/>
            <HeadCell data="编辑" className="edit-bar" attr={({})}/>
            {colElems}</tr>);
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
        const {row, ...rest} = this.props;
        return (<thead><HeadRow cols={row} {...rest}/></thead>);
    }
}

class Paginator extends Component {


    render(){

        let {currPage, totalPage, prevPage, nextPage} = this.props;

        currPage = currPage ? currPage : 1;
        totalPage = totalPage ? totalPage : 1;

        return (<div><div className="btn-group">
          <button className="btn btn-outline-info" onClick={prevPage}>&laquo;</button>
          <button className="btn btn-outline-info" onClick={nextPage}>&raquo;</button>
      </div>
      <span className="page-indicator">{currPage} / {totalPage}</span>
      </div>)
    }
}

class LedgerTable extends Component {

    constructor(props, context){
        super(props, context);
        this.state = {
            head : Object.keys(props.data[0]).map(key => ({data: key, attr:props.columnAttr[key]})),
            body : props.data.map(record => Object.values(record))
        }
        this.state.presentBody = this.state.body;

        this.updateCell = this.updateCell.bind(this);
        this.insertRecord = this.insertRecord.bind(this);
        this.removeRecord = this.removeRecord.bind(this);

        this.columnEditing = this.columnEditing.bind(this);
        this.sortColumn = this.sortColumn.bind(this);
        this.filterColumn = this.filterColumn.bind(this);
        this.toggleFold = this.toggleFold.bind(this);
    }

    toggleFold(col){
        let head = this.state.head,
            fold = head[col].attr.fold;
        head[col].attr.fold = !fold;

        this.setState({head: head});
    }

    columnEditing(col){
        let head = this.state.head;
        head.forEach(col => col.attr.editing = false);
        head[col].attr.editing = true;
        this.setState({head: head});
    }

    insertRecord(row){
        let body = this.state.body;
        body.splice(row+1, 0, this.state.head.map(e=>e.attr.default));
        this.setState({
            body: body,
            presentBody : body
        });
    }

    removeRecord(row){
        let body = this.state.body;
        body.splice(row, 1);
        this.setState({
            body: body
        });
    }

    updateCell(row, col, data){
        let body = this.state.body;
        body[row][col].data = data;
        this.setState({
            body: body,
            presentBody: body
        });
    }

    sortColumn(col){

        let head = this.state.head,
            body = this.state.body;

        let currSort = head[col].attr.sorted,
            order = currSort == "ASCENDING" ? 1 : -1;

        let nextSort = {
            "NONE": "ASCENDING",
            "ASCENDING" : "DESCENDING",
            "DESCENDING" : "ASCENDING"
        }[currSort];

        head[col].attr.sorted = nextSort;

        body.sort((a, b) => {
            return (a[col] < b[col]) ? -1 * order : 1 * order;
        })
        this.setState({
            body: body,
            presentBody : body
        });
        this.setState({head: head});
    }

    filterColumn(col, filter){
        let func;
        if (filter === ""){
            func = (e) => true;
        } else if (filter[0].match(/(\<|\>)/) && filter.slice(1).match(/ *-?\d*\.?\d*/)){
            func = (e) => eval(e+filter)
        } else {
            func = (e) => e === filter;
        }

        let body = this.state.body,
            head = this.state.head,
            presentBody = body.filter(rec => func(rec[col]));
        head[col].attr.filter = filter;
        this.setState({
            head: head,
            body: body,
            presentBody : presentBody
        });
    }

    render() {
        const {name} = this.props;
        let tableID = `table-${name}`;

        return(
        <div>
            <div id={tableID} className="table-outer">
            <table>
                <TableHead
                    name={name}
                    row={this.state.head}
                    columnEditing={this.columnEditing}
                    sortColumn={this.sortColumn}
                    filterColumn = {this.filterColumn}
                    toggleFold = {this.toggleFold}
                />
                <TableBody
                    name={name}
                    rows={this.state.presentBody}
                    columnAttr={this.state.head}
                    updateCell={this.updateCell}
                    insertRecord={this.insertRecord}
                    removeRecord={this.removeRecord}
                    />
            </table></div>
            <Paginator />
        </div>);
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