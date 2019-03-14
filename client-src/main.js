import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import Table from './Ledgable/table.js';
import Balance from "./Ledgable/balance.js";

const typeDefault = {
    "int": { default: 0 },
    "tinyint": { default: 0 },
    "smallint": { default: 0 },
    "float": { default: 0 },
    "money": { default: 0 },
    "nvarchar": { default: "无" },
    "varchar": { default: "无" },
    "bit": { default: false },
    "undefined": { default: 0 },
    "datetime": { default: 0 }
};

let createTable = function (tableType, tableID, tableName, tableDisplayName) {
    
    if(tableID in tables){

        let tableArea = document.getElementById('table-area'),
            colTypeDict = tables['SYS_RPT_ItmDEF'][tableID];

        tables[tableID] = new tableType(tables[tableID], colTypeDict, typeDefault, tableName);
        tables[tableID].render({hideNull:true, hideBool: true}, tableDisplayName, tableArea);

    }

}

let applyCategoryCode = function(tableID){
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

var socket = io.connect(),
    tables = {};

Array.prototype.groupBy = function(key) {
  return this.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

let backupFile = new FileSend(),
    localFile  = new FileSend();

backupFile.setStartFunc((instance) =>{
    socket.emit('start', {
        name: instance.file.name,
        size: instance.file.size
    });
});

backupFile.setOnload((event, instance) => {
    socket.emit('upload', {
        name: instance.file.name,
        segment: event.target.result
    });
});

localFile.setOnload((event, instance) => {
    
    let data = JSON.parse(event.target.result);

    Object.assign(tables, data);

    if('SYS_RPT_ItmDEF' in tables){
        tables['SYS_RPT_ItmDEF'] = tables['SYS_RPT_ItmDEF'].groupBy('TableName');
        for (let tab in tables['SYS_RPT_ItmDEF']){
            let dict = {},
                arr = tables['SYS_RPT_ItmDEF'][tab];

            for (let i = 0; i < arr.length; i++){
                dict[arr[i].FieldName] = {def: arr[i].FieldDef, type: arr[i].FieldType}
            }

            tables['SYS_RPT_ItmDEF'][tab] = dict;
        }
    } else throw TypeError('RPT_ItmDEF table is mandatory.')

    if('SYS_code' in tables){
        let ccodes = tables['SYS_code'],
            dict = {};
        for (let i = 0; i <ccodes.length; i++){
            let currCode = ccodes[i].ccode;
            for (let k in ccodes[i]) {
                if (ccodes[i][k] === null) delete ccodes[i][k];
            }
            dict[currCode] = ccodes[i];
        }
        tables['SYS_code'] = dict;
    } else throw TypeError('ccode table is mandatory.')

    applyCategoryCode('GL_accvouch');
    applyCategoryCode('GL_accsum');

    // console.log(tables['GL_accvouch'][0].ccode);

    let balance = Object.entries(tables['GL_accsum'].groupBy("ccode")).sort();

    createTable(Table, 'GL_accvouch', 'vouchers', "凭证明细 Vouchers");
    createTable(Balance, 'GL_accsum', 'balance', '科目余额 Balances');

})

$('#choose-backup-file').on('change', function () {
    // console.log('here');
    backupFile.start('choose-backup-file');
});

$('#choose-local-file').on('change', function () {
    localFile.start('choose-local-file');
    localFile.readAsText();
});

$('#dump-data').on('click', function(){
    FileSaver.saveAs(new Blob([JSON.stringify(tables)], {type: "mime"}), "tables.json");
})

var updateIndicator = function(message){
    document.getElementById('indicator').innerText = message;
}

var updateIndicatorErr = function(message){
    document.getElementById('indicator').innerText += "\n" + message;
}

socket.on('more', function (data) { 
    updateIndicator("已上传 " + data.percent.toFixed(1)+"% 注意请不要这个时候刷新页面");
    backupFile.readSlice(data.position);
});

socket.on('msg', function (data) {
    switch(data.type){
        case "UPLOAD_DONE":
            backupFile.dispose();
            updateIndicator("上传完成。后台正在复原您刚上传的SQL备份数据，可能要花几分钟。");
            break;
        case "RESTORE_DONE":
            updateIndicator("数据恢复完成，准备显示数据。");
            break;
        case "DATA":
            updateIndicator(`接收到数据表 :[${data.tableName}]`);
            Object.assign(tables, {[data.tableName]:data.data});
            break;

        default :
            updateIndicatorErr("服务器发来了不知道什么类型的消息，有可能是个bug : ["+ data.type + "]");
    }
});