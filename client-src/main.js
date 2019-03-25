import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import React, {Component} from "react";
import {render} from "react-dom";

import LedgerTable from "./Ledgitable/LedgerTable.js"

window.React = React;

var socket = io.connect(),
    tables = {};

let backupFile = new FileSend(),
    localFile  = new FileSend();

backupFile.setStartFunc((instance) =>{
    socket.emit('start', {
        name: instance.file.name,
        size: instance.file.size
    });
});

// backupFile.setOnload((event, instance) => {
//     socket.emit('upload', {
//         name: instance.file.name,
//         segment: event.target.result
//     });
// });


/**
 * Array.prototype.dictionarize
 * ============================
 * This method suppose all its elements are object with same shape, which means
 * same keys with same order. And the function will extract one key/property of
 * each object as key, and finally forms an object.
 * 
 * Note: mistake not with Array.prototype.gather.
 */
Array.prototype.dictionarize = function(field){

    let dict = {};
    for (let i = 0; i < this.length; i++){
        dict[this[i][field]] = this[i];
    }
    return dict;
}

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
let testObject = {a: 1, b: 2, c: 3},
    testObjectMapFunc = (_, e) => e * 10;
console.log(testObject.map(testObjectMapFunc));

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

let testObject2 = {a: 1, b: 2, c: 3},
    testObjectForeach = (_, e) => e * 10;
testObject2.forEach(testObjectForeach)
console.log(testObject2);

/**
 * Object.prototype.filter
 * =======================
 * Returns a new Object with desired properties from original Object. Order will
 * be preserved.
 */
Object.defineProperty(Object.prototype, 'filter', {
    value: function(func){
        let newObject = {},
            keys = Object.keys(this);

        for (let i = 0; i < keys.length; i++)
            if (func(keys[i], this[keys[i]])) 
                newObject[keys[i]] = this[keys[i]];

        return newObject;
    },
    writable : true
})
let testObject3 = {a: 1, b: 2, c: 3, d: 10};
console.log(testObject3.filter((k, v) => v < 5));


Object.defineProperty(Object.prototype, 'merge', {
    value: function(that, inPlace){
        return inPlace ? Object.assign(this, that) : Object.assign({}, this, that);
    }
})

/**
 * Object.prototype.zip
 * ====================
 * This method requires current object (this) and the other (that)
 * contains same keys, and ALL values of the keys are Object too.
 * This method would merge the values of the same keys from two 
 * objects, and yield a new object.
 * 
 */
Object.defineProperty(Object.prototype, 'zip', {
    value: function(that, inPlace){
        let thisKeys = Object.keys(this),
            thisValues = Object.values(this),
            thatKeys = Object.keys(that),
            thatValues = Object.values(that);
        if (thisKeys !== thatKeys)
            throw TypeError('zip requires two objects have same keys')
        else if (thisValues.some(e=>e.constructor !== Object))
            throw TypeError('all values of the current Object should be Object')
        else if (thatValues.some(e=>e.constructor !== Object))
            throw TypeError('all values of the other Object should be Object')

        let object = {};
        for (let i = 0; i < thisKeys.length; i++){
            object[thisKeys[i]] = this[thisKeys[i]].merge(that[thisKeys[i]], inPlace);
        }
        return object;
    }
})

/**
 * Object.prototype.summary
 * ========================
 * Summary takes two arguments, the colAttr and labels.
 * For each column, this function finds corresponding sum function in colAttr, and
 * apply to children, and write the result as the label. So this function is a total
 * in-place operation, though it returns the Object reference.
 * 
 * If labels is given, and contains any key that appear in the object, then the value
 * will be directly used as the label of the column.
 * 
 * Note: If the current Object is nested-gathered, which means the object is gathered
 *       from an array that already contains gathered object, the handling should left
 *       to the columnwise sum function.
 */
Object.defineProperty(Object.prototype, 'summary', {
    value: function(colAttr, labels) {

        if(!this.gid)
            throw TypeError('summary should be applied to objects created from Array.prototype.transform only');

        labels = labels ? labels : {};

        this.forEach((key, elem) => {
            if(key == "gid")
                return elem;
            if (labels[key] !== undefined)
                return Object.assign(elem, {data: labels[key]});
            else if(colAttr[key] && colAttr[key].sum)
                return Object.assign(elem, {data: colAttr[key].sum(elem.children)});
            else
                return Object.assign(elem, {data: "..."});
        })

        console.log(this);

        return this;
    }
})

/**
 * Object.prototype.transpose
 * ==========================
 * transpose (actually un-transpose or unzip) an object created from
 * Array.prototype.transpose.
 * @returns {Array} the array before applying transform.
 */
Object.defineProperty(Object.prototype, 'expand', {
    value : function(e){
        let arr = [],
            len = this.gid.length;
        delete this.gid;

        for (let i = 0; i < len; i++){
            arr.push(this.map((k, v)=>v.children[i]));
        }
        return arr;
    },
    writable: true // Array have function with same name.
})

/**
 * Array.prototype.same
 * ====================
 * return true if all element are identical after applying operator.
 */
Array.prototype.same = function(op){
    op = op ? op : (e) => e;
    return this.every((v, i, a) => op(v) === op(a[0]));
}

Array.prototype.groupBy = function(prop) {  
    return this.reduce((grouped, item) => {
        let key = item[prop];
        grouped[key] = grouped[key] || [];
        grouped[key].push(item);
        return grouped;
    }, {})
};

Array.prototype.columnFilter = function(crit) {
    return this.map(entry=>entry.filter(crit));
}

Array.prototype.gather = function(){
    let dict = {};

    for (let key in this[0]){
        dict[key] = {children: this.map(row => row[key])};
    }

    dict.gid = this.map((_, i) => i);
    return dict;
}

Array.prototype.split = function(crit){
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

console.log(Array(10).fill(0).map((e, i) => i).split((e) => e>5));

Array.prototype.gatherBy = function(col, label, colAttr, currRow) {
    
    currRow = currRow ? currRow : 0;

    let {selected, rest} = this.split(e=>colAttr[col].label(e[col])===label);

    rest.reverse()
        .splice(currRow, 0, selected.gather().summary(colAttr, {[col]: label}));

    return rest;
}

let array = Array(10).fill(0).map((e, i) => ({a:i, b:Math.floor(i/3)}));
console.log(array.gatherBy("b", 0, {"b":{label:(e)=>e.label ? e.label : e}}), "gatherBy");


Array.prototype.expandAt = function(currRow){
    
    let gathered = this[currRow];

    this.splice(currRow, 1, gathered.expand());
}

Array.prototype.gatherAll = function(col, colAttr){
    return this.groupBy(row => row[colKey])
        .map((k, group) => group.gather().summary(colAttr, {[col]: gather}));
}

Array.prototype.expandAll = function(){
    this.map(row => row.expand()).flat();
}


/**
 * setTypeDict
 * ===========
 * This function forms a dictionary that records the data type of fields of each table.
 * When creating a new table, we lookup this dictionary to get the data type of column.
 * The first level is the table name, second the field name, and the entry contains its
 * name, type and def (Chinese name).
 * 
 * @param {Object} data original table data returned from database, or uploaded JSON
 */
function setTypeDict(data){

    if('SYS_RPT_ItmDEF' in data){
        console.time('typeDict')
        let dict = data['SYS_RPT_ItmDEF']
            .groupBy('TableName')
            .map((table)=>table
                .map((entry)=>({name:entry.FieldName, type:entry.FieldType, def:entry.FieldDef})
                .dictionarize('name')
            ));
        
        tables['fieldTypeDict'] = dict;
        console.timeEnd('typeDict')
    } else throw TypeError('RPT_ItmDEF table is mandatory.')

}

function setCategoryDict(data){

    if('SYS_code' in data){
        console.time('ccodes')
        let ccodes = data['SYS_code']
            .map(e=>{
                e.parent = e.ccode.length > 4 ? e.ccode.slice(0, -2) : e.ccode;
                return e;
            })
            .dictionarize('ccode');
        console.timeEnd('ccodes');
        tables['categoryCodeDict'] = ccodes;
    } else throw TypeError('ccode table is mandatory.')

}

function setVouchers(data){

    if('GL_accvouch' in data){

        let vouchDict   = tables['fieldTypeDict']['GL_accvouch'],
            vouchTable  = data['GL_accvouch'].preserveField((key) => (key[0] != "b" && key.slice(0,2)!= "cD" && vouchDict[key] !== undefined)),
            commonAttr  = {default: 0, sorted: "NONE", filter:"", fold:false},
            vouchHeader = Object.assign({}, vouchTable[0]);
        
        for (let key in vouchHeader){
            vouchHeader[key] = Object.assign(vouchDict[key], commonAttr);
        }

        tables['vouchers'] = {
            body : vouchTable,
            head: vouchHeader
        }

        console.log(vouchHeader);

    } else throw TypeError('voucher table (GL_accvouch) is mandatory');
}

localFile.setOnload((event, instance) => {
    
    let data = JSON.parse(event.target.result);

    setTypeDict(data);
    setCategoryDict(data);
    setVouchers(data);
    // applyCategoryCode('GL_accvouch');
    // applyCategoryCode('GL_accsum');

    // let balance = Object.entries(tables['GL_accsum'].groupBy("ccode")).sort();

    // let voucherTable = transformData('GL_accvouch');
    
    render(<LedgerTable {...tables['vouchers']} />, document.getElementById("container"));

})

// $('#choose-backup-file').on('change', function () {
//     // console.log('here');
//     backupFile.start('choose-backup-file');
// });

$('#choose-local-file').on('change', function () {
    localFile.start('choose-local-file');
    localFile.readAsText();
});

// $('#dump-data').on('click', function(){
//     FileSaver.saveAs(new Blob([JSON.stringify(tables)], {type: "mime"}), "tables.json");
// })

// var updateIndicator = function(message){
//     document.getElementById('indicator').innerText = message;
// }

// var updateIndicatorErr = function(message){
//     document.getElementById('indicator').innerText += "\n" + message;
// }

// socket.on('more', function (data) { 
//     updateIndicator("已上传 " + data.percent.toFixed(1)+"% 注意请不要这个时候刷新页面");
//     backupFile.readSlice(data.position);
// });

// socket.on('msg', function (data) {
//     switch(data.type){
//         case "UPLOAD_DONE":
//             backupFile.dispose();
//             updateIndicator("上传完成。后台正在复原您刚上传的SQL备份数据，可能要花几分钟。");
//             break;
//         case "RESTORE_DONE":
//             updateIndicator("数据恢复完成，准备显示数据。");
//             break;
//         case "DATA":
//             updateIndicator(`接收到数据表 :[${data.tableName}]`);
//             Object.assign(tables, {[data.tableName]:data.data});
//             break;

//         default :
//             updateIndicatorErr("服务器发来了不知道什么类型的消息，有可能是个bug : ["+ data.type + "]");
//     }
// });