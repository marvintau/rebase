import {Record, List, Head} from 'persisted';

import FinancialStatementDetails from './local/financialStatementDetails.txt.json';

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

let financialConfHead = new Head({
    title:    'String',
    category: 'Path',
    side:     'Path',
    method:   'Path',
})

export default {
    referred: {
        savedFinancialStatementConf: {desc:'已保存的资产负债表配置表', location: 'remote', type: 'CONF'},
        BALANCE: {desc: '科目余额', location:'remote'}
    },
    importProc({BALANCE, savedFinancialStatementConf}){

        console.log(savedFinancialStatementConf, 'saved')

        let category = List.from(BALANCE.data.map(e => categoryHead.createRecord(e)))
        .flat()
        .ordr(e => e.get('ccode'))
        .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
            let descCode = desc.get('ccode'),
                ancesCode = ances.get('ccode');
            return descCode.slice(0, ancesCode.length).includes(ancesCode)
        });

        financialConfHead.setColProp({colDesc: '项目', isTitle: true}, 'title')
        financialConfHead.setColProp({colDesc: '对应的科目类别', options: category, displayKey: 'ccode_name'}, 'category')
        financialConfHead.setColProp({colDesc: '取值方式', options: sideOptions, displayKey: 'methodName'}, 'side')
        financialConfHead.setColProp({colDesc: '计入方式', options: methodOptions, displayKey: 'methodName'}, 'method')

        let data = List.from(Object.entries(FinancialStatementDetails))
            .map(([title, content]) => {
                let rec = financialConfHead.createRecord({title})
                rec.heir = List.from(content).map(con => financialConfHead.createRecord(con));
                return rec
            })
            .flat()
        console.log(data, 'data')

        return {
            data,
            head: financialConfHead,
            tableAttr:{
                expandable: true,
                editable: true,
                savable: true
            }
        }

    },
    exportProc(data){

        let vanilla = data.slice().map(e => [
            e.cols.title,
            e.heir.map(entry => entry.valueOf())
        ]);
        return Object.fromEntries(vanilla)
   },
    desc: '资产负债表配置表',
    type: 'CONF'
}