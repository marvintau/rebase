import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import Table from './table.js';

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

var socket         = io.connect(),
    tables     = {};

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
    console.log(tables);

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

    if('GL_accvouch' in tables){

        let tableArea = document.getElementById('table-area'),
            typeDict = tables['SYS_RPT_ItmDEF']['GL_accvouch'];


        tables['GL_accvouch'] = new Table(tables['GL_accvouch'], typeDefault, typeDict, 'vouchers');
        tables['GL_accvouch'].render(tableArea, {hideNull:true, hideBool: true}, "凭证明细");

    }

    if('GL_accsum' in tables){

        let tableArea = document.getElementById('table-area'),
            typeDict = tables['SYS_RPT_ItmDEF']['GL_accsum'];

        tables['GL_accsum'] = new Table(tables['GL_accsum'], typeDefault, typeDict, 'journal');
        tables['GL_accsum'].render(tableArea, {hideNull:true, hideBool: true}, "科目总账");

    }

})

$('#single-table-request').on("click", function(e){
    socket.emit('single-table-request', "yayasdasdasdasdasd");
})

$('#choose-backup-file').on('change', function () {
    // console.log('here');
    backupFile.start('choose-backup-file');
});

$('#choose-local-file').on('change', function () {
    localFile.start('choose-local-file');
    localFile.readAsText();
});

$('#clear-all-tables').on('click', function(){
    clearAllTables();
})

$('#dump-data').on('click', function(){
    FileSaver.saveAs(new Blob([JSON.stringify(tables)], {type: "mime"}), "tables.json");
})



function clearAllTables(){
    var myNode = document.getElementById("table-area");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}


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

socket.on('err', function(data){
    switch(data.type){
        case "ETIMEOUT":
            updateIndicatorErr("尴尬了，数据库那边没响应，您稍后再试一下。");
            break;
        default:
            updateIndicatorErr("尴尬了，发生了一个未知的错误 : "+ JSON.stringify(data.type));
    }
})