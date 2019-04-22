import TableState from "./TableState.js";

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
function generateTypeDict(data){

    console.time('typeDict')
    let dict = data['SYS_RPT_ItmDEF']
        .groupBy(e => e['TableName'])
        .map((_tableName, table)=>table
            .map((entry)=>({name:entry.FieldName, type:entry.FieldType, def:entry.FieldDef}))
            .dictionarize('name')
        );

    dict['GL_accsum'].ccode_name = {
        type: "string",
        def: "科目描述"
    };
    dict['GL_accsum'].cclass = {
        type: "string",
        def: "科目类别"
    }

    return dict;

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

function generateCateCodeDict(data){

    return data['SYS_code']
        .map(e=>{
            e.parent = e.ccode.length > 4 ? e.ccode.slice(0, -2) : e.ccode;
            return e;
        })
        .dictionarize('ccode');

}

function applyCateCode(table, ccodeDict){
        
    for (let i = table.length-1; i >=0; i--){
        try {
            let ccode = table[i].ccode;
            table[i].cclass = ccodeDict[ccode].cclass;
            table[i].ccode_name = ccodeDict[ccode].ccode_name;
        } catch {
            console.log(table[i]);
        }
    }

    return table;
}

function vouch(table, typeDict){

    let selectedColumns = [
        'iperiod', 'ioutperiod',
        // 'doutbilldate', 'doutdate',
        'cbill', 'cbook', 'ccashier', 'ccheck',
        'ccode', 'ccode_equal', 'ccus_id', 'cdigest',
        'mc', 'md'];

    let vouchTable  = table.permute(selectedColumns),
        commonAttr  = {sorted: "NONE", filter:""};

    var vouchHeader = vouchTable[0].map((k, _v) => Object.assign({}, commonAttr, typeDict[k]));

    return vouchTable
        .groupBy(rec => rec.ccode).
        map((k, recs)=>recs.groupBy(rec=>rec.iperiod).map((k, v) => new TableState(vouchHeader, v)));
}

function journalTable(table, typeDict, cateCodeDict){

    let selectedColumns = ['iperiod', 'ccode', 'cclass', 'ccode_name', 'mb', 'mc', 'md', 'me'];
    
    let journalTable = table.permute(selectedColumns);
    
    journalTable = applyCateCode(journalTable, cateCodeDict);

    let commonAttr = {sorting: undefined, gathered: false},
        journalHeader = journalTable[0].map((k, _v) => Object.assign({}, commonAttr, typeDict[k]));

    journalHeader = setDefault(journalHeader);


    for (let i = journalTable.length-1; i>=0; i--)
    for (let colName in journalTable[i]){
        let cell = journalTable[i][colName];
        if (cell === null || cell === undefined){
            journalTable[i][colName] = journalHeader[colName].default;
        }
    }

    return new TableState(journalHeader, journalTable);

}


export default function(data){

    let typeDict = generateTypeDict(data);
    let cateCodeDict =  generateCateCodeDict(data);

    let voucherGrouped = vouch(data['GL_accvouch'], typeDict['GL_accvouch']);    
    
    let journal = journalTable(data['GL_accsum'], typeDict['GL_accsum'], cateCodeDict);

    for (let i = 0; i < journal.body.length; i++){
        let {iperiod, ccode} = journal.body[i];
        
        if (voucherGrouped[ccode] && voucherGrouped[ccode][iperiod])
            Object.defineProperty(journal.body[i], 'voucher', {
                value: voucherGrouped[ccode][iperiod]
            })
    }


    journal.head['ccode'].operations = {
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
    
    return journal;
}
