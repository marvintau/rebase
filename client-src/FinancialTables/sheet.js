export default class Sheet {
    constructor({referred={}, type, isSavable=false, status='none', location='local', importProc, exportProc, desc='无描述'}){
        this.referred = referred;
        this.importProc = importProc;
        this.exportProc = exportProc;
        this.type = type;
        this.desc = desc;
        this.isSavable = isSavable;
        
        // for fetching
        this.status = status;
        this.location = location;
    }

    addReferred(name, spec){
        this.referred[name] = spec;
    }

    // 只有存放在remote的数据才会使用receive方法
    receive(data, part, afterRecevied){

        // 如果首次使用receive，初始化blobs
        this.blobs = this.blobs || [];
        this.blobs.push(data);

        if(part === 'LAST'){
            let blob = new Blob(this.blobs);
            
            blob.text()
            .then(text => {
                this.data = JSON.parse(text);
                this.status = 'ready';
                afterRecevied();
            })
        }
    }

    import(sheets){
        this.sections = this.importProc(sheets);
        this.status = 'ready';
    }
}