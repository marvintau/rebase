import Record from './Record';
import List from './List';
import Group from './Group';

export default class Sheet {
    constructor(data, spec){

        let {proc, desc, type, saveProc} = spec;

        // the way of handling data
        this.proc = proc;

        // The turn the data into the saving form.
        this.saveProc = saveProc;

        // table type, can be COMP, CONF or DATA
        this.type = type;

        this.desc = desc;

        switch(this.type){
            case 'CONF':
            case 'DATA':
                this.compute(data);
                break;
            default:
                this.data = this.reformData(data);
        }

    }

    toSavedForm(){
        return this.saveProc(this.data);
    }

    reformData(data){

        if (data.constructor.name === 'List' && data.every(e => e.constructor.name === 'Record')){
            // console.log('Sheet: data is already reformed');
            return data;
        } 

        if (!Array.isArray(data)){
            throw Error(`Sheet: 接收的数据必须是Array，然而${data}`);
        } else if (data.some(e => e.constructor !== Object)){
            throw Error('Sheet: 接受的数据Array中的每个元素必须是普通的Object');
        } 

        let list = new List(0);
        for (let i = data.length-1; i >= 0; i-- ){
            list.push(new Record(data[i]));
        }

        return list;
    }
    
    compute(origData){
        let {head, data} = this.proc(origData);

        if (head !== undefined){
            this.head = head;
        }

        if (data !== undefined){
            this.data = data;
        }
    }

    getNewPath(oldPath, key, level){
        let newPath = oldPath.slicePad(level, '-');
        newPath[level] = key;
        return newPath;
    }

    /**
     * getGroup
     * --------
     * 按给定的path获得嵌套的group中的一个元素。需要特别注意，这个方法获取的是
     * 第一个不是Group的元素，比如我们有一个嵌套的Group深度为10，但是路径却只给到
     * 第5层，那么从第五层往后，它总是会返回每层Group第一个key的元素，一直到第10
     * 层为止。
     * 
     * 这个方法显然不是通用方法，它和Sheet的显示方式有关。因为我们不能因为没有点到
     * 选项卡的最后一级就什么都不显示，相反我们要显示默认每级第一个选项卡的内容。
     * 
     * 因此，我们也并不需要预先知道一共有多少级选项卡，因为getGroup会一直找下去，
     * 找到某一层第一个不是Group的元素为止。
     * 
     * @param {Object} groupPath the given path to specific group
     */
    getGroup(groupPath){

        if(groupPath === undefined){
            groupPath = [];
        }

        let ref = this.data,
            opts = [];

        // console.log('getGroup', ref);
        for (let key of groupPath) if(ref.constructor === Group){
            let keys = ref.keys();
            opts.push({desc: ref.desc, keys});
            ref = ref.get(key === '-' ? keys[0] : key);
        } else {
            break;
        }

        while(ref.constructor === Group){
            let keys = ref.keys();
            opts.push({desc: ref.desc, keys});
            groupPath.push(keys[0]);
            ref = ref.get(keys[0]);
        }

        return {opts, groupPath, groupRef: ref};
    }

    set(path, newVal){
        let [first, ...rest] = path;

        this.get(first).set(rest, newVal);
    }

    insert(path){

        let newRec = (new Record({})).mock(this.head),
            [first, ...rest] = path;

        this.get(first).insert(rest, newRec);

    }
}