import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import Ledger from './ledger.js';

var socket         = io.connect(),
    currTables     = {};


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
    let ledger = new Ledger(data);
    ledger.render('table-area');
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


function clearAllTables(){
    var myNode = document.getElementById("table-area");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

function createDownloadButton(id, data){
    
    let linkElement = document.createElement('button');
    linkElement.innerText = "导出JSON";
    $(linkElement).on('click', function(){
        FileSaver.saveAs(new Blob([JSON.stringify(data)], {type: "mime"}), id+".json");
    })

    return linkElement;
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
            $('#choose-backup-file').prop('disabled', true);
            $('#choose-local-file').prop('disabled', true);

            updateIndicator("上传完成。后台正在复原您刚上传的SQL备份数据，可能要花几分钟。");
            break;
        case "RESTORE_DONE":
            updateIndicator("数据恢复完成， 准备生成数据摘要。");
            break;
        case "SUMMARY":
            updateIndicator("数据摘要生成完毕， 准备获取会计科目。");
            
            tabulate('summary-table', data.summary, [
                {field: "Tablename", title:"表格名称"},
                {field: "lines", title: "表格行数（尺寸）"},
                {field: "Tabledefine", title: "表格描述"}
            ]);
            
            break;
        case "CODE":
            updateIndicator("会计科目获取完毕， 准备生成凭证及明细账。");
            tabulate('general-code',data.code);
            break;
        case "VOUCHER":
            console.log(data);
            updateIndicator("凭证及明细帐已生成。");

            $('#choose-backup-file').prop('disabled', false);
            $('#choose-local-file').prop('disabled', false);
            tabulate('general-acc-voucher',data.voucher);
            break;
        case "ACCSUM":
            console.log(data);
            updateIndicator("科目总账已生成。");

            $('#choose-backup-file').prop('disabled', false);
            $('#choose-local-file').prop('disabled', false);
            tabulate('general-acc-sum',data.accsum);

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