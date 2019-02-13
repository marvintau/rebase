

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

var sliceEnd = function(pos, size){
    return pos + Math.min(524288, size - pos)
}

var updateProgressBar = function(percent){
    document.getElementById("progressBar").value = percent;
}

var updateIndicator = function(message){
    document.getElementById('indicator').innerText = message;
}

socket.on('more', function (data) { 
    updateIndicator("已上传 " + data.percent.toFixed(1)+"%");
    updateProgressBar(data.percent);
    var position = data.position * 524288;
    var fileSlice = null;

    for (method of ["slice", "webkitSlice", "mozSlice"]) if (currFile[method]){
        fileSlice = currFile[method](position, sliceEnd(position, currFile.size));
        break;
    }
    if (fileSlice)
        currFileReader.readAsBinaryString(fileSlice); // trigger upload event
});

socket.on('msg', function (data) {
    switch(data.type){
        case "UPLOAD_DONE":
            delete currFileReader;
            delete currFile;
            updateProgressBar(100);
            updateIndicator("上传完成，开始数据复原，可能花几分钟");
            break;
        case "RESTORE_DONE":
            updateIndicator("数据恢复完成， 准备生成明细账");
            break;
        default :
            updateIndicator("服务器发来了不知道什么类型的消息，有可能是个bug :"+data);
    }
});