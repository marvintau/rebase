Object.flatten = function(obj, func, prefix){

    if(func === undefined) func = (p, k) => (p ? p+"-" : "") + k;

    if((typeof obj !== "object") || (obj.length !== undefined))
        return {[prefix]: obj};

    let result = {};
    for (let key in obj)
        Object.assign(result, Object.flatten(obj[key], func, func(prefix, key)));

    return result;
}

Object.nestedKeyToLayered = function(obj, delim) {

    if (delim === undefined) delim = "-";

    let keys    = Object.keys(obj),
        layers  = [],
        allDone = array => array.every(e => e.lastIndexOf(delim) < 0);
        
    let splitAtLastDelim = function(str) {
        let pos = str.indexOf(delim);
        if (pos == -1)
            return {most: str, rest: str};
        else 
            return {most: str.slice(0, pos), rest:str.slice(pos+1)};
    }

    for(;!allDone(keys);){
        let splits = keys.map(splitAtLastDelim);
        layers.push(splits.map(e=>e.most));
        keys = splits.map(e => e.rest);
    }
    layers.push(keys);

    return layers;
}


Array.prototype.isAllSame = function(func){
    let first = func(this[0]);
    for (let i = 1; i < this.length; i++){
        if (func(this[i]) !== first) return false;
    }
    return true;
}

class Table{
    
    /**
     * Table constructor accepts array of object, where the object
     * should contain only primitive data structure, like string or
     * interger. The object is nestable, but for nested object, all
     * its children should be object as well. Consider the record as
     * a full-tree.
     * 
     * @param {Array of Object} data an array of object
     */
    constructor(data){
 
        if( data.length != undefined ) {

            // 1. Array of array: In this case, like most of the scientific
            //    computing software, the inner array represents the column,
            //    while the outer the row. The header is left blank and can
            //    be added later.
            
            if (data.every(e=>e.length !== undefined) &&
                data.every(e=>e.every(ee => typeof ee !== "object"))){
                    this.body = data;
                }

            // 2. Array of object: In this case, like most of the database,
            //    the object represents the record, while the array the row.
            //    The header are derived from the object keys.

            else if (data.every(e=> typeof e === "object")) {
                this.body = data.map(e => Object.flatten(e).values());
                this.head = 
            }

        } else {
            throw new TypeError("The input data is not even an array.");
        }
            

    }
}