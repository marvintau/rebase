import {Record, List, Head, Sheet, Table} from 'persisted';

import cashflowStatementDirectDetails from './local/cashflowStatementDirectDetails.txt.json';

let categoryHead = new Head({
    ccode: 'String',
    ccode_name: 'String'
})

let methodHead = new Head({
    method: 'String',
    methodName: 'String'
})

let sideOptions = [
    methodHead.createRecord({method: '期初', methodName: '期初'}),
    methodHead.createRecord({method: '贷方', methodName: '贷方'}),
    methodHead.createRecord({method: '借方', methodName: '借方'})
]

let methodOptions = [
    methodHead.createRecord({method: '计入', methodName: '计入'}),
    methodHead.createRecord({method: '减去', methodName: '减去'}),
]

let head = new Head({
    title:       "String",
    category:    "Path",
    side:        "Path",
    method:      "Path",
})

let dateHead = new Head({
    year: 'String',
    endPeriod: 'String'
})

function importProc({BALANCE, savedCashFlowConf}){

    let category = List.from(BALANCE.data)
    .map(e => categoryHead.createRecord(e))
    .flat()
    .ordr(e => e.get('ccode'))
    .uniq(e => e.get('ccode'))
    .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
        let descCode = desc.get('ccode'),
            ancesCode = ances.get('ccode');
        return descCode.slice(0, ancesCode.length).includes(ancesCode)
    });

    head.setColProp({colDesc: '项目', isTitle: true, isExpandToggler: true}, 'title')
    head.setColProp({colDesc: '对应的科目类别', options: category, displayKey: 'ccode_name'}, 'category')
    head.setColProp({colDesc: '取值方式', options: sideOptions, displayKey: 'methodName'}, 'side')
    head.setColProp({colDesc: '计入方式', options: methodOptions, displayKey: 'methodName'}, 'method')

    let confData = cashflowStatementDirectDetails,
        date = {year:2014, endPeriod: 12};
    if (savedCashFlowConf.data.length > 0 || Object.keys(savedCashFlowConf.data).length > 0){
        let [savedSec1, savedSec2] = savedCashFlowConf.data;
        confData = savedSec2;
        date = savedSec1;
    }

    confData = List.from(Object.entries(confData))
        .map(([title, content]) => {
            let rec = head.createRecord({title});

            rec.heir = List.from(Object.entries(content).map(([title, content]) => {
                let rec = head.createRecord({title});
                rec.heir = List.from(content).map(con => head.createRecord(con));
                return rec;
            }));

            return rec
        })
        .flat(2);

    dateHead.setColProp({colDesc: '起始年'}, 'year');
    dateHead.setColProp({colDesc: '截止期间'}, 'endPeriod');

    console.log(date, 'cashflow')

    return [
        new Table(dateHead, List.from([dateHead.createRecord(date)]), {
            editable: true
        }),
        new Table(head, confData, {
            expandable: true,
            editable: true
        }),
    ]
}

function exportProc(sections){
    let [sec1, sec2] = sections;

    let entries = sec2.data.slice().map(e => {
        let entries = e.heir.map (sub => {
            let entryList = sub.heir.map(entry => {
                return entry.cols
            });

            return [sub.cols.title, entryList]
        });

        return [e.cols.title, Object.fromEntries(entries)]
    })

    let date = sec1.data[0].cols;

    let result =  Object.fromEntries(entries);
    return [date, result];
}

export default function(){ 
    return new Sheet({
        referred: {
            savedCashFlowConf: {desc:'已保存的现流表配置表', location: 'remote', type: 'CONF'},
            BALANCE: {desc: '科目余额', location:'remote'}
        },
        importProc,
        exportProc,
        desc: '现金流量表配置表',
        type: 'CONF',
        isSavable: true
    })
}