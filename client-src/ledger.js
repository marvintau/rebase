import Table from './table.js';

/**
 * Table can be initiated from three types of source. Either an object that
 * holds several columns in array from, or an array that holds several rows
 * in object form. For the two types of data, the object must be flat (a.k.a
 * not nested), or an array of array without any header, just a plain table.
 * 
 * For grouped column or rows, the grouping method must be specified along
 * the data.
 * 
 * Finally, render the table with contentEditable cell, and all the changes
 * must be saved to the data held by Table object.
 */

Array.prototype.last = function(){
    return this[this.length - 1];
}

    /**
     * Flatten a nested object structure into single-layer, by preserving the 
     * path by concatenating the keys with delimiter.
     * 
     * @example {a: {b: 1, c: 2, f: {d:4, g: 5}}} -> {a-a-}
     * 
     * @param {Object} obj the data object
     * @param {string} prefix prefix
     * @param {string} delim delimiter
     */

 function flat (data, prefix, delim){
    
    let result = {};
    for (let key in data) {
        let p = (prefix ? prefix + delim : "") + key;
        if (data[key] && data[key].constructor === Object)
            Object.assign(result, flat(data[key], p, delim));
        else
            Object.assign(result, {[p] : data[key]})
    }

    return result;
}

function layer(data) {

    let delim = "-",
        flatObj = flat(data, "", delim);

    let keys    = Object.keys(flatObj),
        layers  = [],
        allDone = array => array.every(e => e.lastIndexOf(delim) < 0);
    
    // split the string into two parts at the last delimiter
    let splitAtLastDelim = (str, delim, pos) =>
        (pos = str.indexOf(delim)) == -1 ? 
        {most: str, rest: str} :
        {most: str.slice(0, pos), rest:str.slice(pos+1)};

    for(;!allDone(keys);){
        let splits = keys.map(e => splitAtLastDelim(e, delim));
        layers.push(splits.map(e=>e.most));
        keys = splits.map(e => e.rest);
    }
    layers.push(keys);

    return layers;
}

export default class Ledger extends Table{

    /**
     * Table constructor accepts array of object, where the object
     * should contain only primitive data structure, like string or
     * interger. The object is nestable, but for nested object, all
     * its children should be object as well. Consider the record as
     * a full-tree.
     * 
     * @param {Array of Object} data an array of object
     */
    constructor(data, name, parentDom){

        let head = [[]],
            body = [[]];

        if (data.every(e=> typeof e === "object")) {
            if(data.length > 0){
                head = layer(data[0]),
                body = data.map(e => Object.values(flat(e)));
                super(head, body, name, parentDom);
            }
        }
        // 3. Object of arrays.
        else if(data.constructor === Object) {
                head = layer(data),
                body = transpose(data);
                super(head, body, name, parentDom);
        } else {
            throw new TypeError('Ledger: unrecognized data. It must be Array of objects, or Object of arrays');
        }

        this.typeDict = {
            "int"      : {default: 0},
            "tinyint"  : {default: 0},
            "smallint" : {default: 0},
            "float"    : {default: 0},
            "money"    : {default: 0},
            "nvarchar" : {default: "无"},
            "varchar"  : {default: "无"},
            "bit"      : {default: false},
            "undefined": {default: 0},
            "datetime" : {default: "1970-01-01T00:00:00Z"}
        }

    }

    /**
     * 
     * assign column datatype.
     * the data type will be according to the last row of head (or the most detailed
     * data). Both the 
     * 
     * @param {Object} columnTypeDict the object (dictionary) from another big table
     */
    assignColumnDatatype(columnTypeDict){

        this.head.lastRow().forEach((e, i) => {
            let typeEntry = columnTypeDict[e.data];
            typeEntry = typeEntry ? typeEntry : {type: "undefined", def: e.data, hide: true};
            Object.assign(e.attr, typeEntry);
            this.body.attrCol(i, typeEntry);
            this.head.attrCol(i, typeEntry);
        });
    }

    /**
     * normalize columns:
     * mainly eliminates the NULLs by replacing to equivalent data according to the
     * column datatype.
     */
    normalizeColumns(){

        this.body.forEach((cell, _row, col) =>{
            let type = this.body.colAttrs[col].type,
                colRep = this.typeDict[type].default;
            cell.data = cell.data == null ? colRep : cell.data;
        })
    }

}
