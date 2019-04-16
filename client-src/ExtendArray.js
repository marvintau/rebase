
/**
 * Object.prototype.map
 * ====================
 * Apply function over each value of the property, with both key and value as
 * parameter. Returns a new Object.
 */
Object.defineProperty(Object.prototype, "map", {
    value: function(func){
        let newObject = {},
            keys = Object.keys(this);
        for (let i = 0; i < keys.length; i++)
            newObject[keys[i]] = func(keys[i], this[keys[i]]);        
        return newObject;
    }
})

/**
 * Object.prototype.forEach
 * ========================
 * The in-place version of Object.prototype.map, slightly different to Array's
 * forEach. The function passed into should always return a value, which will
 * be assigned to corresponding property.
 */
Object.defineProperty(Object.prototype, "forEach", {
    value: function(func){
        let keys = Object.keys(this);
        for (let i = 0; i < keys.length; i++)
            this[keys[i]] = func(keys[i], this[keys[i]]);
        return this;
    }
})

Object.defineProperty(Object.prototype, 'some', {
    value: function(func){
        let values = Object.values(this);
        return values.some(func);
    }
})

/**
 * Object.prototype.values
 * =======================
 * copy the static method Object.values into prototype.
 */
Object.defineProperty(Object.prototype, 'values', {
    value: function(){
        return Object.values(this);
    }
})

Object.defineProperty(Object.prototype, 'keys', {
    value: function(){
        return Object.keys(this);
    }
})

/**
 * Object.prototype.rewrite
 * ========================
 * rewrite an object with given key order. Non-existed keys will be omitted.
 */
Object.defineProperty(Object.prototype, 'rewrite', {
    value: function(keys){
        let newObject = {};

        for (let i = 0; i < keys.length; i++){
            // console.log(keys[i]);
            if (this[keys[i]] !== undefined){
                newObject[keys[i]] = this[keys[i]];
            }
        }

        return newObject;
    }
})

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
    return this.reduce((grouped, item) => {
        let key = labelFunc(item);
        grouped[key] = grouped[key] || [];
        grouped[key].push(item);
        return grouped;
    }, {});
};

Array.prototype.flatten = function(childFunc){

    return this.reduce((flattened, item) => {

        let children = childFunc(item);

        return (children === undefined) ? flattened.concat(item) : flattened.concat(children.flatten(childFunc));
    }, [])
}

Array.prototype.flatten2 = function(childFunc){

    let res = [];

    for (let item of this){
        let children = childFunc(item);
        if (children) {
            res.push(...children.flatten2(childFunc));
        } else {
            res.push(item);
        }
    }

    return res;
}

Array.prototype.sortBy = function(colName){

    let val = (e) => e.value ? e.value : e;
    
    this.sort((a, b) =>
        val(a[colName]) < val(b[colName]) ? -1 :
        val(a[colName]) > val(b[colName]) ? 1  : 0
    )
}

Array.prototype.sum = function(){
    return this.reduce((s, x) => s+x, 0);
}

Array.prototype.extrema = function(oper, func){

    let extrema = [], rest = [];
    
    while(this.length > 0){
        let next = this.pop(),
            last = extrema.pop();
        
        if (last === undefined) {
            extrema.push(next);
        } else if (oper(next) === oper(last)) {
            extrema.push(last, next);
        } else if (oper(next)  >  oper(last)) {
            rest.push(...extrema.splice(0, extrema.length, next));
        } else {
            extrema.push(last);
            rest.push(next);
        }
    }
    
    if (func !== undefined){
        extrema.reverse();
        extrema = func(extrema);
        extrema.reverse();
    }
    
    while(extrema.length > 0){
        this.push(extrema.pop());
    }

    while(rest.length > 0){
        this.push(rest.pop());
    }
}

Array.prototype.nest = function(key, funcs){

    let {summaryFunc, labelFunc, termFunc, oper} = funcs;

    let pack = function(parentCate, groupedRecs){

        let record = summaryFunc(groupedRecs);
        record[key] = parentCate;
        
        Object.defineProperty(record, "children", {
            value: groupedRecs,
        });
    
        return record;
    
    }
    
    while(this.some(termFunc)){
        
        this.extrema(oper, (ex)=>{
            return ex.groupBy((e) => labelFunc(e[key])).map(pack).values();
        });
            
    }
    
    return this;
}
