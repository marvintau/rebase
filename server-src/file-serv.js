import {promises as fs} from 'fs';

const BLOCK_SIZE = 524288;

/**
 * FileServer (originally FileRecv)
 * 
 * 服务端的文件chunk分发机制。主要包含三个方法，分别是 open, read和write
 * 
 * Open需要用户提供当文件找不到时的机制。在实际应用中，我们通过Open来指定新创建的
 * configuration file。
 * 
 * 对于一个即将接受并写入服务器的文件，需要由客户端提供文件的尺寸，以及即将写入的文
 * 件chunk。由服务器更新当前写入的位置，并返回这个位置。对于一个即将读取并发送到客
 * 户端的文件，由客户更新即将读取的位置。
 * 
 * Read和Write均需要用户提供读取一个完整文件块，和最后一个（可能不完整的）文件块的机制。
 */

export default class FileServ {

    constructor(path, size){

        this.filePath = path;
        this.fileSize = size || 0;
    }

    writeChunk(position, chunkBuffer, afterWrite){
    
        console.log('writeChunk', position, chunkBuffer);

        return fs.open(this.filePath, 'a', 0o755)
        .then(fileHandle => {
            return fileHandle.write(chunkBuffer)
            .then(({bytesWritten}) => {
                
                position += bytesWritten;

                let progress = position / this.fileSize,
                    part = (position === this.fileSize) ? 'LAST' : 'MOST';

                let message = {position, part, progress};

                // afterWrite receives the updated position for requesting
                // next chunk of file.
                return afterWrite(message);
            })
            .catch(err => console.error(`Write@WriteChunk: ${err}`))
            .finally(() => {
                fileHandle.close();
            })
        })
        .catch(err => console.error(`Open@WriteChunk: ${err}`))
    }

    readChunk(position, afterRead, notExisted){

        // buffer 应当在第一次读取文件的时候创建，并在文件读取结束时deallocate
        if(this.buffer === undefined){
            this.buffer = Buffer.allocUnsafe(BLOCK_SIZE);
        }

        // 我们为何要在此处使用position? 
        // 如果不指派position的话，每次就会更新文件本身的位置指针。然而如果由多名
        // 用户同时访问并传输同一个文件，那么就一定会出错。因此我们在这里指定
        // position，并且read的position是从客户端发来，这样确保每个用户同时访问文
        // 件的时候使用的是自己的指针。

        return fs.stat(this.filePath)
        .then(({size}) => {
          this.fileSize = size;
          return fs.open(this.filePath, 'r', 0o755)
        })
        .then((fileHandle) =>{
            return fileHandle.read(this.buffer, 0, BLOCK_SIZE, position)
            .then(({bytesRead, buffer}) => {

                let nextPos = position + bytesRead;
                buffer = buffer.slice(0, bytesRead);

                let progress = nextPos / this.fileSize,
                    part = (nextPos === this.fileSize) ? 'LAST' : 'MOST';
                let message = { part, nextPos, progress, buffer}
                console.log(message);
                return afterRead(message);
            })
            .catch(err => console.error(`Read@ReadChunk: ${err}`))
            .finally(() => {
                fileHandle.close();
            })
        })
        .catch(err => {
            if (notExisted){
                notExisted(err);
            } else {
                console.error(`Open@ReadChunk: ${err}`)
            }
        })
    }

    writeFile(data, afterWrite){
        
        return fs.open(this.filePath, 'w', 0o755)
        .then(handle => {
            return handle.writeFile(data)
            .then(res => {
                handle.close()
                .then(() => {
                    if (afterWrite !== undefined){
                        afterWrite(this);
                    }
                })
                .catch(err => {
                    console.error('close on writeFile: ', err);
                })
            })
        })
    }
}