import List from './List';
import Sheet from './Sheet';

function typeCheck(value){
    if (typeof value === 'string' || value instanceof String){
        return 'String';
    } else if (typeof value === 'number' && Number.isFinite(value)){
        return 'Number';
    } else if (value && typeof value === 'object' && value.constructor === Array){
        return 'Array';
    } else if (value === null){
        return 'Null';
    } else if (typeof value === 'undefined'){
        return 'Undefined';
    } else if (typeof value === 'boolean'){
        return 'Boolean';
    } else {
        console.log('unknown type of ', value);
        return 'Unknown';
    }

}

export default class Record {
    constructor(cols, spec={}){
        this.cols = cols;

        let {subs, tabs} = spec;
        
        this.subs = new List(0);
        if(subs){
            for (let sub of subs){
                this.sub(sub);
            }
        }

        this.tabs = undefined;
        if(tabs){
            this.tabs = tabs;
        }

        this.path = [];

        // this is for beautifying display only.
        this.subDepth = 1;
    }

    type(typeDict, key){
        let elem = typeDict.find(e => e.colKey===key);
        // console.log(key, 'record type');
        if(elem && elem.attr && elem.attr.type !== undefined){
            return elem.attr.type;
        } else {
            return typeCheck(this.cols[key]);
        }
    }

    trim(keys){
        let newCols = {};
        for (let key in this.cols){
            if (keys.indexOf(key) === -1){
                newCols[key] = this.cols[key];
            }
        }
        this.cols = newCols;
    }

    pick(keys){
        let newCols = {};
        for (let key of keys){
            if (key in this.cols){
                newCols[key] = this.cols[key];
            } else if('oldKey' in key){
                let {oldKey, newKey} = key;
                if(oldKey in this.cols){
                    newCols[newKey] = this.cols[oldKey];
                }
            }
        }
        return new Record(newCols);
    }

    mock(dict){
        let newCols = {};
        for (let {colKey, attr} of dict){
            if(colKey in this.cols){
                newCols[colKey] = this.cols[colKey];
            } else{
                if(attr !== undefined) {
                    let {type} = attr;
                    switch(type){
                    case 'Number':
                        newCols[colKey] = 0; break;
                    case 'Date':
                        newCols[colKey] ='0'; break;
                    default:
                        newCols[colKey] = ''; break;
                    }
                } else {
                    newCols[colKey] = '';
                }
            }
        }

        return new Record(newCols);
    }

    keys(){
        return Object.keys(this.cols);
    }

    toList(head){
        return new List(...head.map(e => ({...e, value: this.cols[e.colKey]})));
    }

    toObject(){
        return Object.assign({}, this.cols);
    }

    get(key){
        return this.cols[key];
    }

    set(key, value){

        if (Array.isArray(key)){
            let [realKey] = key;
            this.cols[key] = value; 
        } else {
            this.cols[key] = value;
        }

    }

    sub(rec){
        rec.pathPrefix(this.path, this.subs.length);
        rec.parent = this;

        this.subs.push(rec);
        this.subDepth = Math.max(...this.subs.map(rec => rec.subDepth)) + 1
        
        let ancestor = this.parent;
        while(ancestor){
            ancestor.subDepth = Math.max(...ancestor.subs.map(rec => rec.subDepth)) + 1;
            ancestor = ancestor.parent;
        }
    }

    tab(data, head){
        this.tabs = new Sheet(data, {head});
        return this;
    }

    pathPrefix(ancesPath, index){
        this.path.unshift(...ancesPath, index);
        for (let sub of this.subs){
            sub.pathPrefix(ancesPath, index);
        }
    }
}