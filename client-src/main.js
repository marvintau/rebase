import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import React, {Component} from "react";
import {render} from "react-dom";

import LedgerTable from "./Ledgitable/LedgerTable.js"

import "./ExtendObject.js"
import "./ExtendArray.js"

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


class Accountable {
    constructor(head, body){
        
        this.head     = head;
        this.body     = body;
        this.presBody = body;

        this.sortKeyOrder  = [];
        this.filters = [];
        this.pagers  = [];
    }

    permuteColumns(colNameOrder){
        this.head = this.head.rewrite(colNameOrder);
        this.body = this.body.map(record => record.rewrite(colNameOrder));
        this.presBody = this.body;
    }

    marshall(){
        for (let i = this.body.length-1; i>=0; i--)
        for (let colName in this.body[i]){
            let cell = this.body[i][colName];
            if (cell === null || cell === undefined){
                this.body[i][colName] = this.head[colName].default;
            }
        }
    }

    /**
     * addPager
     * ========
     * Add a new way of paging, and controlled by a paginator.
     * 
     * The default paging method is to split the records into pages according
     * to the record number. And this will not affect the structure body. However
     * you may define your own way of paging, which will separate the body into
     * several groups, and switch different groups with paginator. Thus it's more
     * like a "group switcher".
     * 
     * There could be multiple custom pager, which means you may separate the body
     * into a hierarchical groups.
     * 
     * After separating the body into groups with a pager, the sort, filter, and
     * default paging method will be affect the innermost group.
     * 
     * Moreover, addPager should not be used as a dynamic/interactive operation.
     * Pagers should be prepared before rendering.
     * @param {string} pagerName
     * @param {Function} pagerFunc pager function
     * @param {Function} displayFunc display paging
     * 
     */
    addPager(name, pagerFunc, displayFunc){
        this.pagers.push({
            name, pagerFunc, displayFunc
        })
    }

    /**
     * applyPagers
     * ===========
     * apply all pager function at one (and should be only one) time.
     */
    applyPagers(){
        // for (let i = 0; i > )
    }

    addSort(colName){

        let isDesc = true;
                   
        this.sortKeyOrder.push(colName);
        this.head[colName].sorting = {isDesc, keyIndex: this.sortKeyOrder.length - 1};
        this.sort();
    }
    toggleSort(colName){

        this.head[colName].sorting.isDesc = !this.head[colName].sorting.isDesc;
        this.sort();
    }

    removeSort(colName){

        this.sortKeyOrder.splice(this.sortKeyOrder.indexOf(colName), 1);
        this.head[colName].sorting = undefined;
        this.updateKeyOrder();
        this.sort();
    }

    updateKeyOrder(){
        for (let i = 0; i < this.sortKeyOrder.length; i++){
            let colName = this.sortKeyOrder[i];
            this.head[colName].sorting.keyIndex = i;
        }
    }

    setFilter(colName, filter){

        let makeFilterFunc = (filterText) => {
            let func;
            if (filterText === ""){
                func = (e) => true;
            } else if (filterText[0].match(/(\<|\>)/) && filterText.slice(1).match(/ *-?\d*\.?\d*/)){
                func = (e) => {return eval(e+filterText)}
            } else {
                func = (e) => e === filterText || e.includes(filterText);
            }
            return func;    
        }

        this.head[colName].filter = {
            text : filter,
            func : makeFilterFunc(filter)
        };

        this.presBody = this.body;

        for (let colName in this.head){
            let filterFunc = this.head[colName].filter.func;
            this.presBody = this.presBody.filter((rec) => filterFunc(rec[colName]));
        }

    }

    applyAllFilters(){


    }

    /**
     * sort
     * ============
     * sort on both original data and displayed data. Deep-copying the whole
     * table will be costy, and not necessary, thus we do a write-through.
     */
    sort(){

        for (let i = 0; i < this.sortKeyOrder.length; i++){
            let colName = this.sortKeyOrder[i];

            if(this.head[colName].sorting === undefined) continue;

            let isDesc = this.head[colName].sorting.isDesc ? 1 : -1;
            this.body.sort((a, b) => ((a[colName] < b[colName]) ? -1 : 1) * isDesc);
        }

        this.presBody = this.body;
    }


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
            .groupBy(e => e['TableName'])
            .map((_tableName, table)=>table
                .map((entry)=>({name:entry.FieldName, type:entry.FieldType, def:entry.FieldDef}))
                .dictionarize('name')
            );

        tables['fieldTypeDict'] = dict;

        tables['fieldTypeDict']['GL_accsum'].ccode_name = {
            type: "string",
            def: "科目描述"
        };
        tables['fieldTypeDict']['GL_accsum'].cclass = {
            type: "string",
            def: "科目类别"
        }

        console.timeEnd('typeDict')
        console.log(dict);

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

function setLabelFunc(colAttr){
    
    let typeDict = {
        money: {
            sum: (colChildren) => {
                let sum = colChildren
                    .map(n => parseFloat(n))
                    .filter(e=>!isNaN(e))
                    .reduce((acc, n) => acc+n, 0);
                return "Total: " + sum;
            }
        }
    }

    let columnSpecDict = {
        ccode : {
            label: (col) => {
                return col.length > 4 ? col.slice(0, -2) + '-Gathered' : col;
            },
            sort:  (a, b) => {
                let ra = a.ccode.data ? a.ccode.data : a.ccode, 
                    rb = b.ccode.data ? b.ccode.data : b.ccode;
                
                return ra > rb ? 1 : ra < rb ? -1 : 0;
            }    
        }
    }

    for (let k in colAttr){
        if (k in columnSpecDict){
            Object.assign(colAttr[k], columnSpecDict[k]);
        } else if (colAttr[k].type in typeDict){
            Object.assign(colAttr[k], typeDict[colAttr[k].type]);
        }
    };

    return colAttr;
}

function setDefault(colAttr){
    let typeDefault = {
        money: 0,
        int: 0,
        smallint: 0,
        tinyint: 0,
        float: 0,
        bit: 0,
        varchar: "无",
        nvarchar: '无'
    }

    for (let k in colAttr) {
        if (colAttr[k].type in typeDefault){
            colAttr[k].default = typeDefault[colAttr[k].type];
        }
    }
    return colAttr;
}

function applyCategoryCode(table){
    let ccodes = tables['categoryCodeDict'];
    
    let maxLen = Math.max(...table.map(e=>e.ccode.length));

    for (let i = table.length-1; i >=0; i--){
        try {
            let ccode = table[i].ccode;
            // table[i].ccode = `${ccode}${" ".repeat(maxLen-ccode.length)}-${ccodes[ccode].cclass}:${ccodes[ccode].ccode_name}`;
            table[i].cclass = ccodes[ccode].cclass;
            table[i].ccode_name = ccodes[ccode].ccode_name;
        } catch {
            console.log(table[i]);
        }
    }

    return table;
}

function setVouchers(data){

    if('GL_accvouch' in data){

        let vouchDict   = tables['fieldTypeDict']['GL_accvouch'],
            vouchTable  = data['GL_accvouch'].columnFilter((key,_val) => (key[0] != "b" && key.slice(0,2)!= "cD" && vouchDict[key] !== undefined)),
            commonAttr  = {sorted: "NONE", filter:"", folded:false},
            vouchHeader = vouchTable[0].map((k, _v) => Object.assign({}, commonAttr, vouchDict[k]));

        tables['vouchers'] = new Accountable(vouchHeader, vouchTable);

    } else throw TypeError('voucher table (GL_accvouch) is mandatory');
}

function setJournal(data){

    if('GL_accsum' in data){
        let journalDict = tables['fieldTypeDict']['GL_accsum'],
            journalTable = data['GL_accsum'].columnFilter();
        journalTable = applyCategoryCode(journalTable);

        let commonAttr = {sorting: undefined, filter: {text:"", func:(e)=>true}, folded: false, filtered: false, aggregated: false},
            journalHeader = journalTable[0].map((k, _v) => Object.assign({}, commonAttr, journalDict[k]));

        journalHeader = setLabelFunc(journalHeader);
        journalHeader = setDefault(journalHeader);

        
        tables['journal'] = new Accountable(journalHeader, journalTable);
        tables['journal'].marshall();
        tables['journal'].permuteColumns(['iperiod', 'cclass', 'ccode', 'ccode_name', 'mb', 'mc', 'md', 'me'])

        console.log(tables['journal']);

    } else throw TypeError('journal table (GL_accsum) is mandatory');
    
}

localFile.setOnload((event, instance) => {
    
    let data = JSON.parse(event.target.result);

    setTypeDict(data);
    setCategoryDict(data);
    // setVouchers(data);
    setJournal(data);
    // applyCategoryCode('GL_accvouch');
    // applyCategoryCode('GL_accsum');

    // let balance = Object.entries(tables['GL_accsum'].groupBy("ccode")).sort();

    // let voucherTable = transformData('GL_accvouch');
    
    render(<LedgerTable table={tables['journal']} />, document.getElementById("container"));

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