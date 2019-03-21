import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import {List, Map, fromJS} from "immutable";
import React, {Component} from "react";
import {render} from "react-dom";

import {createStore} from 'redux';

import LedgerTable from "./Ledgitable/LedgerTable.js"

window.React = React;

var socket = io.connect(),
    tables = Map();

let backupFile = new FileSend(),
    localFile  = new FileSend();

backupFile.setStartFunc((instance) =>{
    socket.emit('start', {
        name: instance.file.name,
        size: instance.file.size
    });
});

// backupFile.setOnload((event, instance) => {
//     socket.emit('upload', {
//         name: instance.file.name,
//         segment: event.target.result
//     });
// });

const INSERT = 'INSERT',
      REMOVE = 'REMOVE',
      SORT   = 'SORT',
      FILTER = 'FILTER';
    
function insertRecord(row, record) {
    return {type:'insert', row, record};
}

function removeRecord(row){
    return {type:'remove', row};
}

function sort(col){
    return {type:'sort', col};
}

function filter(col, pattern){
    return {type:'filter', col, oper, val};
}

let theTable = List([0, 0, 0, 0]).map((e, i)=>List([i, i, i, i]));
/**
 * Ledger
 * ======
 * a simple reducer that holds the table data structure
 * No initial state, left to createStore
 * 
 * @param {List<List<Map>>} table (Immutable) List of List .
 * @param {PlainObject} action 
 */
function Ledger(table, action){
    switch(action.type){
        case "insert":
            return table.insert(action.row, action.record);
        case 'remove':
            return table.remove(action.row);
        case 'sort':
            return table.sort((prev, next)=>{
                if (prev[action.col] > next[action.col]) return 1;
                if (prev[action.col] < next[action.col]) return -1;
                if (prev[action.col] === next[action.col]) return 0;
            })
        case 'filter':
            let filterFunc = (e) => eval(e[action.col]+action.oper+action.val);
            return table.filter(filterFunc);
        default:
            return table;
    }
}

const store = createStore(Ledger, theTable);
const unsubscribe = store.subscribe(() => console.log(store.getState().toJS()))
store.dispatch(insertRecord(3, List(['a', 'b', 'c', 'd'])));

function applyCategoryCode(tableID){
    let vouchers = tables[tableID],
        ccodes = tables['SYS_code'];
    for (let i = 0; i < vouchers.length; i++){
        let ccode = tables[tableID][i].ccode,
            ccodeEntry = tables['SYS_code'][ccode];
    
        let name = "";
        for (let l = ccode.length; l >= 4; l -=2 ){
            name = ccodes[ccode.slice(0, l)].ccode_name + ":" + name;
        }
        name = name.slice(0, -1);

        tables[tableID][i].ccode = `${ccode}-${ccodeEntry.cclass}-${name}`;
    }
}

function transformData(tablename){
    let table = tables[tablename],
        tableTypeDict = tables['SYS_RPT_ItmDEF'][tablename],
        commonAttr = {default: 0, sorted: "NONE", filter:"", fold:false};

    for (let key in tableTypeDict){
        Object.assign(tableTypeDict[key], commonAttr);
        if (tableTypeDict[key].type === "bit")
            tableTypeDict[key].fold = true;
    }

    tableTypeDict._commonAttr = commonAttr;
    
    return {
        name: tablename,
        columnAttr: tableTypeDict,
        data: table
    }

}

localFile.setOnload((event, instance) => {
    
    let data = JSON.parse(event.target.result);

    Object.assign(tables, data);

    if('SYS_RPT_ItmDEF' in tables){

        let dict = fromJS(tables['SYS_RPT_ItmDEF'])
            .groupBy(x=>x.get('TableName'))
            .map(tablewise => tablewise
                .groupBy(x=>x.get('FieldName'))
                .map(e=>Map({
                    type: e.getIn([0, 'FieldType']),
                    def:  e.getIn([0, 'FieldDef'])
                }))
            );
        
        tables.set('fieldTypeDict', dict);

    } else throw TypeError('RPT_ItmDEF table is mandatory.')

    if('SYS_code' in tables){
        let ccodes = fromJS(tables['SYS_code'])
            .groupBy(entry=>entry.get('ccode'))
            .map(group=>{
                let ccode = group.getIn([0, 'ccode']);
                return Map({
                    class: group.getIn([0, 'cclass']),
                    def : group.getIn([0, 'ccode_name']),
                    parent : ccode.length > 4 ? ccode.slice(0, -2) : ccode
                })
            })
        console.log(ccodes.toJS(), "ccode");
        // tables['SYS_code'] = dict;
    } else throw TypeError('ccode table is mandatory.')

    // applyCategoryCode('GL_accvouch');
    // applyCategoryCode('GL_accsum');

    // let balance = Object.entries(tables['GL_accsum'].groupBy("ccode")).sort();

    // let voucherTable = transformData('GL_accvouch');
    
    // render(<LedgerTable {...voucherTable} />, document.getElementById("container"));
    // createTable(Table, 'GL_accvouch', 'vouchers', "凭证明细 Vouchers");
    // createTable(Balance, 'GL_accsum', 'balance', '科目余额 Balances');

})

// $('#choose-backup-file').on('change', function () {
//     // console.log('here');
//     backupFile.start('choose-backup-file');
// });

$('#choose-local-file').on('change', function () {
    localFile.start('choose-local-file');
    localFile.readAsText();
});

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