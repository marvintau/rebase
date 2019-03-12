import { flat, layer } from "./locus.js";
import Table from './table.js';

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
    constructor(data, name){

        let head = [[]],
            body = [[]];

        if (data.every(e=> typeof e === "object")) {
            if(data.length > 0){
                head = layer(data[0]),
                body = data.map(e => Object.values(flat(e)));
                super(head, body, name);
            }
        }
        // 3. Object of arrays.
        else if(data.constructor === Object) {
                head = layer(data),
                body = transpose(data);
                super(head, body, name);
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
            "datetime" : {default: 0}
        }

        this.colTypes = Array(this.size.cols).fill(0).map(e => ({ type: "undefined", def: "undefined", hide: true }));
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
            if (typeEntry) {
                this.colTypes[i] = typeEntry;
                this.colTypes[i].default = this.typeDict[typeEntry.type].default;
                Object.assign(e.attr, typeEntry);
            }
        });

        this.forEachCell((cell, _row, col) =>{
            let typeEntry = this.colTypes[col];
        
            cell.attr.type = typeEntry.type;
            cell.data = (cell.data == null || cell.data == "***") ? typeEntry.default : cell.data;
        })

    }

}
