

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

socket.on('more', function (data) { 
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

socket.on('done', function (data) {
    delete currFileReader;
    delete currFile;
    updateProgressBar(100);
});