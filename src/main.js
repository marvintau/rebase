import io from 'socket.io-client';
import FileSaver from 'file-saver';

var socket         = io.connect(),
    currFile       = null,
    currFileReader = null;

$('#choose-file').on('change', function () {
    currFile = document.getElementById('choose-file').files[0];

    if (currFile) {
        console.log("fileLoaded: ", currFile.name);
        currFileReader = new FileReader();
        currFileReader.onload = function (evnt) {
            socket.emit('upload', {
                name: currFile.name,
                segment: evnt.target.result
            });
        };
        socket.emit('start', {
            name: currFile.name,
            size: currFile.size
        });
    }
});

$('#choose-local-file').on('change', function () {
    currFile = document.getElementById('choose-local-file').files[0];

    if (currFile) {
        currFileReader = new FileReader();
        currFileReader.readAsText(currFile);
        currFileReader.onload = function (evnt) {

            let data = JSON.parse(evnt.target.result);
            clearAllTables();
            tabulate(currFile.name, data);
        };
    }
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

function tabulate(id, data, columns) {

    columns = columns ? columns : Object.keys(data[0]).map(elem=>({field:elem, title:elem, filterControl:"input"}));

    let elem = document.createElement("table");
    elem.setAttribute("data-show-columns", "true");
    elem.setAttribute("data-filter-control", "true");
    elem.setAttribute("style", "white-space: nowrap; word-wrap: none; font-size:70%;");
    $('#table-area').append(elem);

    data.forEach(function(elem){
        for (let col in elem) switch(elem[col]){
            case null  : elem[col] = "无"; break;
            case false : elem[col] = "否"; break;
            case true  : elem[col] = "是"; break;
        }
    })

    $(elem).bootstrapTable({
        filterControl: true,
        showColumns: true,
        pagination: true,
        search: true,
        locale: "zh-CN",
        columns: columns,
        data:data});
    
    $('#table-area').append(createDownloadButton(id, data));

}

var sliceEnd = function(pos, size){
    return pos + Math.min(524288, size - pos)
}

var updateIndicator = function(message){
    document.getElementById('indicator').innerText = message;
}

var updateIndicatorErr = function(message){
    document.getElementById('indicator').innerText += "\n" + message;
}

var updateSummaryTable = function(table){
    tabulate('summary-table',table, [
        {field: "Tablename", title:"表格名称"},
        {field: "lines", title: "表格行数（尺寸）"},
        {field: "Tabledefine", title: "表格描述"}
    ]);
}

var updateVoucherTable = function(table){
    tabulate('general-acc-voucher',table);
}

socket.on('more', function (data) { 
    updateIndicator("已上传 " + data.percent.toFixed(1)+"% 注意请不要这个时候刷新页面");
    var position = data.position * 524288;
    var fileSlice = null;

    for (let method of ["slice", "webkitSlice", "mozSlice"]) if (currFile[method]){
        fileSlice = currFile[method](position, sliceEnd(position, currFile.size));
        break;
    }
    if (fileSlice)
        currFileReader.readAsBinaryString(fileSlice); // trigger upload event
});

socket.on('msg', function (data) {
    console.log(data);
    switch(data.type){
        case "UPLOAD_DONE":
            currFileReader = currFile = undefined;
            $('#choose-file').prop('disabled', true);
            $('#choose-local-file').prop('disabled', true);

            updateIndicator("上传完成。后台正在复原您刚上传的SQL备份数据，可能要花几分钟。");
            break;
        case "RESTORE_DONE":
            updateIndicator("数据恢复完成， 准备生成数据摘要。");
            break;
        case "SUMMARY":
            updateIndicator("数据摘要生成完毕， 准备生成明细账。");
            updateSummaryTable(data.summary);
            break;
        case "VOUCHER":
            updateIndicator("明细账已生成。");
            $('#choose-file').prop('disabled', false);
            $('#choose-local-file').prop('disabled', false);

            updateVoucherTable(data.voucher);
            break;

        default :
            updateIndicatorErr("服务器发来了不知道什么类型的消息，有可能是个bug : ["+ data.type + "]");
    }
});

socket.on('err', function(data){
    switch(data.type){
        case "TIMEOUT":
            updateIndicatorErr("尴尬了，数据库那边没响应，您稍后再试一下。");
            break;
        default:
            updateIndicatorErr("尴尬了，发生了一个未知的错误 : "+data.type);
    }
})