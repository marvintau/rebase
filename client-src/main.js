import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';


var socket         = io.connect(),
    currTables     = {};


let backupFile = new FileSend();

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

$('#single-table-request').on("click", function(e){
    socket.emit('single-table-request', "yayasdasdasdasdasd");
})

$('#choose-backup-file').on('change', function () {
    // console.log('here');
    backupFile.start('choose-backup-file');
});

$('#choose-local-file').on('change', function () {
    currFile = document.getElementById('choose-local-file').files[0];

    if (currFile) {
        currFileReader = new FileReader();
        currFileReader.readAsText(currFile);
        currFileReader.onload = function (evnt) {

            let data = JSON.parse(evnt.target.result);

            if (currTables.code === undefined){
                if(!currFile.name.includes('code'))
                    updateIndicatorErr('您得先上传会计科目表才行，不然后面没法计算');
                else {
                    let dict = {};
                    for (let i = 0; i < data.length; i++){
                        dict[data[i]['科目编码']] = {name: data[i]['科目名称'], type: data[i]['科目类型']};
                        // let type = data[i]['科目编码'],

                    }
                    currTables.code = dict;
                }
            } else if (currFile.name.includes('voucher')) {

                currTables.voucher = data;                

                clearAllTables();
                tabulate('凭证表', currTables.voucher);
            }
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

function createOptions(assocTableID, groupName, options, onChange){
    let radioGroup = document.createElement('div');
    $(radioGroup).addClass('btn-group btn-group-toggle btn-area');
    for (let option of options){
        let label = document.createElement('label');
        let input = document.createElement('input');
        $(input).attr({type:'radio', name:groupName, id:option.value});
        $(label).addClass('btn btn-primary').text(option.label).append(input);
        $(radioGroup).append(label);
    }
    $(radioGroup).on('change', (e) => onChange(e));
    console.log($('#'+assocTableID).closest('.bootstrap-table').get(0));
    $('#'+assocTableID).closest('.bootstrap-table').first().prepend(radioGroup);
}

function tabulate(id, data) {

    // If data is included in an object with multiple layers, which means key 
    // (column name) could include several sub object (sub columns), the data
    // should be flatten out to a single layer table (an array that includes
    // non-nested object), and transform a record into column table.

    // 1. Flatten out data table
    // console.log(Object.flatten(data[0]), tabulate flatten);
    // data = data.map(e => Object.flatten(e));
    let flattenedKeys = Object.keys(data[0]);

    // // 2. reorganize columns;
    // let columns = Object.nestedKeys(data[0], '-');

    let columns = [Object.keys(data[0])];
    
    for (let i = 0; i < columns.length; i++)
    for (let j = 0; j < columns[i].length; j++){
        columns[i][j] = {
            field:columns[i][j],
            title:columns[i][j],
            colspan : 1,
            rowspan : 1,
            valign: "middle",
            halign: "middle",
            align: "right"
        };

        if(j > 0 && columns[i][j-1].title === columns[i][j].title) {
            columns[i][j-1].colspan += 1;
            columns[i][j].markedDelete = true;
        }
        if(i > 0 && columns[i-1][j].title === columns[i][j].title) {
            columns[i-1][j].rowspan += 1;
            columns[i][j].markedDelete = true;
        }
        if(i == columns.length-1){
            columns[i][j].field = flattenedKeys[j];
            columns[i][j].formatter = (n) => {
                if (typeof n === "number"){
                    var parts = n.toFixed(2).split(".");
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                    n = parts.join(".");
                }
                return n;
            }
        }
    }

    for (let i = 0; i < columns.length; i++)
    for (let j = 0; j < columns[i].length; j++)
        if(columns[i][j].markedDelete) {
            columns[i].splice(j, 1);
            j--;
    }

    console.log(columns);

    let elem = document.createElement("table");
    elem.setAttribute('id', id);
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