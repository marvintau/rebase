import Group from './Group';
import Record from './Record';
import Sheet from './Sheet';

const EPSILON = 1e-3;

export default class List extends Array {
    constructor(...args){
        super(...args);
    }

    last(){
        return this[this.length - 1];
    }

    grip(func, logger=()=>{}, desc){

        let group = {};

        for (let i = 0; i < this.length; i++){
            // console.log('grip', this[i], func(this[i]));
            let key = func(this[i]);
            if(!(key in group)){
                group[key] = new List(0)
            }
            group[key].push(this[i]);
        }

        logger(`按 ${desc} 分组`)

        return new Group(desc, group);
    }

    tros(func, order=1, logger=()=>{}, desc){
        if (func === undefined){
            this.sort();
        } else {
            this.sort((a, b) => (func(a) - func(b))*order);
        }

        logger(desc)
        return this;
    }

    uniq(func, logger=()=>{}, desc="") {
        
        console.log('uniq', this.length, desc);
        let uniq = {};
        for (let i = 0; i < this.length; i++){
            uniq[func(this[i])] = this[i];
        }

        let list = new List(0);
        for (let key in uniq){
            list.push(uniq[key]);
        }

        logger(desc);

        return list;
    }

    dups(func){
        let list = new List(0);

        for (let i = 0; i < this.length-1; i++){
            if (func(this[i]) === func(this[i+1])){
                list.unshift(this[i]);
            }
        }

        return list;  
    }

    accum(key){
        let res = new List(0);
        res.push(this[0].get(key))
        for (let i = 1; i < this.length; i++){
            res.push(res.last() + this[i].get(key));
        }
        return res;
    }

    cascade(layerFunc, gatherFunc, logger=()=>{}, desc) {

        let layers = this.grip(layerFunc).vals();
        layers.reverse();

        // The descendants are on the head of List, by finding and
        // getting merged into their ancestors, the ancestors become
        // new descandants.
        for (var descendants = layers.shift(); layers.length > 0; descendants = layers.shift()) {
            let ancestors = layers[0];
            while (descendants.length > 0) {
                let entry = descendants.shift();
                for (let maybeParent of ancestors) if (gatherFunc(entry, maybeParent)) {
                    maybeParent.sub(entry);
                }
            }
        }

        for (let i = 0; i < descendants.length; i++){
            let entry = descendants[i];
            entry.pathPrefix([], i);
        }

        logger(desc);

        return descendants;
    }

    flatten(logger=()=>{}, desc){

        const stack = new List(...this);
        const res = new List(0);
        while (stack.length) {
            const next = stack.shift();
            res.push(next);
            if (next.subs.length) {
                stack.push(...next.subs);
            }
        }

        logger(desc);

        return res;
    }

    pathApply(path, func){

        let [first, ...rest] = path,
            ref = this[first],
            res = [];
        

        res.push(func(ref));
        while(rest.length > 0){
            let next = rest.shift();
            ref = ref.subs[next];
            res.push(func(ref, rest.length === 0));
        }

        return res;
    }

    join(from, {fromCol, thisCol}){

        // 1. build up a dictionary with entry of 
        //    value of the column. 
        let fromDict = new Map();
        for (let i = from.length-1; i >= 0; i--){
            fromDict.set(fromCol, from[i][fromCol]);
        }

        // 2. find the entry which has same value
        //    in given column, combine two record
        //    together.
        for (let i = this.length-1; i >= 0; i--){
            let thisColVal = this[i][thisCol];
            if(fromDict.has(thisColVal)){
                Object.assign(this[i], fromDict.get(thisColVal));
            }
        }
    }

    extend(colName, func){
        for (let i = this.length-1; i >= 0; i--){
            if(this[i].get(colName) === undefined)
                this[i].set(colName, func(this[i]));
        }
    }

    pad(number, setVals={}){

        let empty = Object.fromEntries(Object.keys(empty).map(k => [k, '']));
        Object.assign(empty, setVals);
        this.push(...Array(number).fill(0).map(e => ({...empty})));
    }

    same(key){
        return this.every((rec, i, lis) => rec.get(key) === lis[0].get(key));
    }

    sum(typeDict){
        let first = this[0].mock(typeDict);
        for (let key of first.keys()){
            if (this.every(rec => rec.type(typeDict, key) === 'Number')){
                
                let res = this
                    .map(rec => rec.get(key))
                    .reduce((acc, elem) => acc + elem, 0)
                    
                if (isNaN(res)){
                    res = "";
                }

                first.set(key, res)

            } else if (this.every(rec => rec.type(typeDict, key) === 'Date')){
                if(this.same(key)){
                    first.set(key, `${this[0].get(key)}`)    
                } else {
                    first.set(key, `${this[0].get(key)}-${this.last().get(key)}`)
                }
            } else if(this.every(rec => rec.get(key) === undefined)){
            } else {
                let val = this.same(key) ? this[0].get(key) : '...';
                first.set(key, val);
            }
        }
        
        return first;
    }

    accum(func){
        return this.reduce((acc, curr) => {
            if(acc.length === 0){
                return new List(...[curr]);
            } else {
                let last = acc.last();
                return new List(...acc, func(last, curr));
            }
        }, new List(0));
    }
    
    randomSample(n){
        let samples = new List(0);
        for (let i = 0; i < n; i++){
            let randIndex = parseInt(Math.random() * this.length);
            samples.push(this[randIndex]);
        }

        return samples;
    }

    slicePad(n, padder){
        if(n <= this.length){
            return this.slice(0, n);
        } else {
            return this.concat(Array(n-this.length).fill(padder));
        }
    }

    get(index){
        return this[index].subs;
    }

    set(path, newValue){
        let [first, ...rest] = path;
        if(rest.length === 0){
            this[first].set(rest, newValue);
        } else {
            this.get(first).set(rest, newValue);
        }
    }

    insert(path, newRec){
        let [first, ...rest] = path;
        if(rest.length === 0){
            this.splice(first, 0, newRec);
        } else {
            this[first].subs
        }
    }

    toCascadedObject(key){
        let cascaded = {};
        for (let item of this){
            cascaded[item.get(key)] = item.subs.toCascadedObject(key);
        }
        return cascaded;
    }
}