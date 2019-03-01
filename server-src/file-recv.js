import {promises as fs} from 'fs';

export default class FileRecv {

    constructor(size, path){
        this.fileSize = size,
        this.filePath = path,
        this.data     = '',
        this.currLen  = 0,
        this.handler  = null

        this.blockSize = 524288;
    }

    getPercent () {
        return parseInt((this.currLen / this.fileSize) * 100);
    };
    getPosition () {
        return this.currLen / this.blockSize;
    };

    updateLen(data){
        this.data    += data;
        this.currLen += data.length;
    }

    isFinished(){
        return this.fileSize === this.currLen;
    }

    write(){
        // returns a promise
        return this.handler.write(this.data, 0, "Binary");
    }

    open(){
        // https://nodejs.org/api/fs.html#fs_fspromises_open_path_flags_mode
        // returns a Promise that finally resolved a FileHandle object
        return fs.open(this.filePath, 'a', 0o755);
    }

    close(){
        return this.handler.close();
    }

    delete(){
        return fs.unlink(this.filePath);
    }

    progress(){
        return  {
            'position': this.getPosition(),
            'percent':  this.getPercent()
        }
    }
}