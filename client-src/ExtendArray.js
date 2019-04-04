
class Range {
    constructor(a=0, b=0){
        this.a = a;
        this.b = b;
    }

    add(n){
        if(n.constructor.name === 'Range'){
            if(n.a < this.a){
                this.a = n.a;
            }
            if(n.b > this.b){
                this.b = n.b;
            }
        } if (n < this.a){
            this.a = n;
        } else if (n > this.b){
            this.b = n;
        }
    }

    fromArray(array){
        for (let i = 0; i < array.length; i++){
            this.add(array[i]);
        }
    }

    toString(){
        return this.a == this.b ? `${this.a}` : `${this.a}-${this.b}`;
    }
}

Array.prototype.prev = function(cur){
    return cur == 0 ? 0 : cur-1;
}

Array.prototype.next = function(cur){
    return cur == this.length-1 ? cur : cur+1;
}

Array.prototype.last = function(){
    return this[this.length - 1];
}

/**
 * Array.prototype.dictionarize
 * ============================
 * This method suppose all its elements are object with same shape, which means
 * same keys with same order. And the function will extract one key/property of
 * each object as key, and finally forms an object.
 * 
 * Note: mistake not with Array.prototype.gather.
 * @param {string} field
 * 
 */
Array.prototype.dictionarize = function(field){

    let dict = {};
    for (let i = 0; i < this.length; i++){
        let key = this[i][field];
        delete this[i][field];
        dict[key] = this[i];
    }
    return dict;
}

/**
 * Array.prototype.same
 * ====================
 * return true if all element are identical after applying operator.
 */
Array.prototype.same = function(op){
    op = op ? op : (e) => e;
    return this.every((v, i, a) => op(v) === op(a[0]));
}

Array.prototype.groupBy = function(labelFunc) {  
    let grouped = this.reduce((grouped, item) => {
        let key = labelFunc(item);
        grouped[key] = grouped[key] || [];
        grouped[key].push(item);
        return grouped;
    }, {});

    return grouped;
};

Array.prototype.sortBy = function(colName){

    let val = (e) => e.value ? e.value : e;
    
    this.sort((a, b) =>
        val(a[colName]) < val(b[colName]) ? -1 :
        val(a[colName]) > val(b[colName]) ? 1  : 0
    )
}

Array.prototype.columnFilter = function(crit) {
    return this.map(entry=>entry.filter(crit));
}

Array.prototype.zip = function(colSums){
    let record = {};

    if(colSums === undefined){
        colSums = this[0].map((k, v) => (values) => "...");
    }

    for (let colName in this[0]){

        let children = this.map(row => row[colName]),
            value    = colSums[colName] ? colSums[colName](children): "...";

        record[colName] = {value, children};
    }

    Object.defineProperty(record, "gid", {
        value: this.map((e, i) => e.gid ? e.gid : i),
        writable: false,
        enumerable: false
    })
    
    return record;
}

Array.prototype.select = function(crit){
    let selected = [], rest = [];
    while(this.length > 0){
        let last = this.pop();
        if(crit(last)) selected.push(last);
        else rest.push(last);
    }
    selected.reverse();
    rest.reverse();

    return {selected, rest};
}

Array.prototype.sum = function(){
    return this.reduce((s, x) => s+x, 0);
}

Array.prototype.range = function(){
    return `${Math.min(...this)}-${Math.max(...this)}`;
}

function randomString(len){
    return Math.random().toString(36).substr(2, len);
}

function generateCategories(len){
    let res = [];

    for (let i = 0; i < len; i++) {
        let pos = Math.ceil(Math.random()*res.length + 5);
        if (pos >= res.length)
            res.push(randomString(4));
        else
            res.push(res[pos] + randomString(2));
    }

    res.sort();

    return res.map((e) => ({ccode: e, mb: Math.random(), mc: Math.random(), md: Math.random()}));
    
}

let cate = generateCategories(5000);


Array.prototype.nest = function(key, summaryFunc){

    let pack = function(parentCate, groupedRecs){

        let record = summaryFunc(groupedRecs);
        record[key] = parentCate;
        
        Object.defineProperty(record, "children", {
            value: groupedRecs,
            enumerable: false,
            writable: false
        });
    
        return record;
    
    }
    
    while(this.some((e) => e[key].length > 4)){
        
        // 1. find the deepest category level
        let deepest = Math.max(... this.map(e => e[key].length));
        // console.log(deepest, "deepest");

        // 2. select the records WITH deepest category level OUT OF
        //    original table
        let {selected, rest} = this
            .select((e) => e[key].length === deepest);
        // console.log(selected, 'selected');

        // 3. generate the records of their parent level
        let parentRecords = selected
            .groupBy((e) => e[key].slice(0, deepest - 2))
            .map(pack)
            .values();

        this.splice(this.length)
        this.push(...rest)
        this.push(...parentRecords);

    }
    
    return this;
}