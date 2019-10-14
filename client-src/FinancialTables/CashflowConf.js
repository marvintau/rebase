import {Record, List, Head} from 'persisted';

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

export default {
    referred: {
        savedCashFlowConf: {desc:'已保存的资产负债表配置表', location: 'remote', type: 'CONF'},
        CATEGORY: {desc: '科目类别', location:'remote'}
    },
    importProc({CATEGORY, savedCashFlowConf}){

        let category = new List(CATEGORY.data.map(e => categoryHead.createRecord(e)))
        .flat()
        .ordr(e => e.get('ccode'))
        .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
            let descCode = desc.get('ccode'),
                ancesCode = ances.get('ccode');
            return descCode.slice(0, ancesCode.length).includes(ancesCode)
        }, '按科目级联');

        console.log(cashflowStatementDirectDetails, 'detailes');
        head.setColProp({colDesc: '项目', isTitle: true, isExpandToggler: true}, 'title')
        head.setColProp({colDesc: '对应的科目类别', options: category, displayKey: 'ccode_name'}, 'category')
        head.setColProp({colDesc: '取值方式', options: sideOptions, displayKey: 'methodName'}, 'side')
        head.setColProp({colDesc: '计入方式', options: methodOptions, displayKey: 'methodName'}, 'method')

        let data = cashflowStatementDirectDetails;
        if (savedCashFlowConf.data.length > 0 || Object.keys(savedCashFlowConf.data).length > 0){
            data = savedCashFlowConf.data;
        }

        data = new List(Object.entries(data))
            .map(([title, content]) => {
                let rec = head.createRecord({title});

                rec.heir = new List(Object.entries(content).map(([title, content]) => {
                    let rec = head.createRecord({title});
                    rec.heir = new List(content).map(con => head.createRecord(con));
                    return rec;
                }));

                return rec
            })
            .flat(2)

        return {data, head, tableAttr:{
                expandable: true,
                controllable: true,
                editable: true,
                savable: true
            }
        }

    },
    exportProc(data){
        let entries = data.slice().map(e => {
            let entries = e.heir.map (sub => {
                let entryList = sub.heir.map(entry => {
                    return entry.valueOf()
                });

                return [sub.cols.title, entryList]
            });

            return [e.cols.title, Object.fromEntries(entries)]
        })

        return Object.fromEntries(entries);
    },
    desc: '现金流量表配置表',
    type: 'CONF'
}