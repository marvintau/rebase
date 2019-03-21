import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import React, {Component} from "react";
import {render} from "react-dom";

import LedgerTable from "./Ledgitable/LedgerTable.js"

window.React = React;

var socket = io.connect(),
    tables = {};

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

Array.prototype.groupBy = function(prop) {  
    return this.reduce((grouped, item) => {
        let key = item[prop];
        grouped[key] = grouped[key] || [];
        grouped[key].push(item);
        return grouped;
    }, {})
};

Array.prototype.preserveField = function(crit) {
    return this.map(entry => {
        let dict = {};
        for (let key in entry) if (crit(key)) dict[key] = entry[key];
        return dict;
    })
}

Array.prototype.toDictWithField = function(field){

    // Object.fromEntries are only supported by Chrome 73 above

    let dict = {};
    for (let i = 0; i < this.length; i++){
        dict[this[i][field]] = this[i];
    }
    return dict;
}

function setTypeDict(data){

    if('SYS_RPT_ItmDEF' in data){
        console.time('typeDict')
        let dict = data['SYS_RPT_ItmDEF'].groupBy('TableName');
        for (let tableName in dict){
            dict[tableName] = dict[tableName]
                .map(entry=>({name:entry.FieldName, type:entry.FieldType, def:entry.FieldDef}))
                .toDictWithField('name');
        }
        
        tables['fieldTypeDict'] = dict;
        console.timeEnd('typeDict')
    } else throw TypeError('RPT_ItmDEF table is mandatory.')

}

function setCategoryDict(data){

    if('SYS_code' in data){
        console.time('ccodes')
        let ccodes = data['SYS_code']
            .map(e=>{
                e.parent = e.ccode.length > 4 ? e.ccode.slice(0, -2) : e.ccode;
                return e;
            })
            .toDictWithField('ccode');
        console.timeEnd('ccodes');
        tables['categoryCodeDict'] = ccodes;
    } else throw TypeError('ccode table is mandatory.')

}

function setVouchers(data){

    if('GL_accvouch' in data){

        let vouchDict   = tables['fieldTypeDict']['GL_accvouch'],
            vouchTable  = data['GL_accvouch'].preserveField((key) => (vouchDict[key] !== undefined)),
            commonAttr  = {default: 0, sorted: "NONE", filter:"", fold:false},
            vouchHeader = Object.entries(vouchTable[0]).map((key, _) =>
                Object.assign({}, vouchDict[key], commonAttr)
            );

        tables['vouchers'] = {
            body : vouchTable,
            head: vouchHeader
        }

        console.log(vouchTable);

    } else throw TypeError('voucher table (GL_accvouch) is mandatory');
}

localFile.setOnload((event, instance) => {
    
    let data = JSON.parse(event.target.result);

    setTypeDict(data);
    setCategoryDict(data);
    setVouchers(data);
    // console.log(tables.get('vouchers').toJS());
    // applyCategoryCode('GL_accvouch');
    // applyCategoryCode('GL_accsum');

    // let balance = Object.entries(tables['GL_accsum'].groupBy("ccode")).sort();

    // let voucherTable = transformData('GL_accvouch');
    
    render(<LedgerTable {...tables['vouchers']} />, document.getElementById("container"));

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