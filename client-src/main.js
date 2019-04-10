import io from 'socket.io-client';
import FileSaver from 'file-saver';
import FileSend from './file-send';

import React, {Component} from "react";
import {render} from "react-dom";

import LedgerTable from "./Ledgitable/LedgerTable.js"

import Accountable from "./Accountable.js";

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



class Range {
    constructor(a=1, b=1){
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
        return this;
    }

    toString(){
        let res = this.a == this.b ? `${this.a}` : `${this.a}-${this.b}`;
        return res;
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
        
    for (let i = table.length-1; i >=0; i--){
        try {
            let ccode = table[i].ccode;
            table[i].cclass = ccodes[ccode].cclass;
            table[i].ccode_name = ccodes[ccode].ccode_name;
        } catch {
            console.log(table[i]);
        }
    }

    return table;
}

function setJournal(data){

    if('GL_accvouch' in data){

        let vouchDict   = tables['fieldTypeDict']['GL_accvouch'],
            vouchTable  = data['GL_accvouch'],
            commonAttr  = {sorted: "NONE", filter:""};
        
        var vouchHeader = vouchTable[0].map((k, _v) => Object.assign({}, commonAttr, vouchDict[k])),
            vouchers = new Accountable(vouchHeader, vouchTable);
        vouchers.permuteColumns(['iperiod', 'ioutperiod', 'doutbilldate', 'doutdate', 'cbill', 'cbook', 'ccashier', 'ccheck', 'ccode', 'ccode_equal', 'ccus_id', 'cdigest', 'mc', 'md']);
        vouchers.applyColumn(['doutbilldate', 'doutdate'], (d, h) => {
            return (d === undefined || d === null) ? '空' : d.split('T')[0];
        })
    
        var voucherGrouped = vouchers.body.groupBy(rec => rec.ccode).map((k, recs)=>recs.groupBy(rec=>rec.iperiod))

    } else throw TypeError('voucher table (GL_accvouch) is mandatory');


    if('GL_accsum' in data){
        let journalDict = tables['fieldTypeDict']['GL_accsum'],
            journalTable = data['GL_accsum'];
        journalTable = applyCategoryCode(journalTable);

        let commonAttr = {sorting: undefined, gathered: false},
            journalHeader = journalTable[0].map((k, _v) => Object.assign({}, commonAttr, journalDict[k]));

        journalHeader = setDefault(journalHeader);

        
        tables['journal'] = new Accountable(journalHeader, journalTable);
        tables['journal'].marshall();
        tables['journal'].permuteColumns(['iperiod', 'ccode', 'cclass', 'ccode_name', 'mb', 'mc', 'md', 'me'])
        
        for (let i = 0; i < tables['journal'].body.length; i++){
            let {iperiod, ccode} = tables['journal'].body[i];
            
            if (voucherGrouped[ccode] && voucherGrouped[ccode][iperiod])
                Object.defineProperty(tables['journal'].body[i], 'voucher', {
                    value: new Accountable(vouchers.head, voucherGrouped[ccode][iperiod])
                })
        }

        tables['journal'].head['ccode'].operations = {
            'gather': {
                labelFunc: (e) => e.slice(0, e.length - 2),
                termFunc:  (e) => e.ccode.length > 4,
                oper:(e) =>e.ccode.length,

                summaryFunc: (recs) => {
                    let rec = Object.assign({}, recs[0]);
                    rec.ccode_name = '...';
                    rec.iperiod = (new Range()).fromArray(recs.map(e=>e.iperiod)).toString();
                    rec.mb = parseFloat(recs.filter(e=>e.iperiod===1).map(e=>e.mb).sum()).toFixed(2);
                    rec.mc = parseFloat(recs.filter(e=>e.children===undefined).map(e=>e.mc).sum()).toFixed(2);
                    rec.md = parseFloat(recs.filter(e=>e.children===undefined).map(e=>e.md).sum()).toFixed(2);
                    rec.me = parseFloat(recs.filter(e=>e.iperiod===12).map(e=>e.me).sum()).toFixed(2);

                    return rec;
                }
            },
        };

    } else throw TypeError('journal table (GL_accsum) is mandatory');
    
}

localFile.setOnload((event, instance) => {
    
    let data = JSON.parse(event.target.result);

    setTypeDict(data);
    setCategoryDict(data);
    // setVouchers(data);
    setJournal(data);

    
    render(<LedgerTable table={tables['journal']} recordsPerPage={30} isReadOnly={false} />, document.getElementById("container"));

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