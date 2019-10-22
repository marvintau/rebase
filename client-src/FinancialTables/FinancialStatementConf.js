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

let dateHead = new Head({
    year: 'String',
    endPeriod: 'String'
})

export default {
    referred: {
        savedFinancialStatementConf: {desc:'已保存的资产负债表配置表', location: 'remote', type: 'CONF'},
        BALANCE: {desc: '科目余额', location:'remote'}
    },
    importProc({BALANCE, savedFinancialStatementConf}){

        let category = List.from(BALANCE.data.map(e => categoryHead.createRecord(e)))
        .flat()
        .ordr(e => e.get('ccode'))
        .uniq(e => e.get('ccode'))
        .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
            let descCode = desc.get('ccode'),
                ancesCode = ances.get('ccode');
            return descCode.slice(0, ancesCode.length).includes(ancesCode)
        });

        financialConfHead.setColProp({colDesc: '项目', isTitle: true}, 'title')
        financialConfHead.setColProp({colDesc: '对应的科目类别', options: category, displayKey: 'ccode_name'}, 'category')
        financialConfHead.setColProp({colDesc: '取值方式', options: sideOptions, displayKey: 'methodName'}, 'side')
        financialConfHead.setColProp({colDesc: '计入方式', options: methodOptions, displayKey: 'methodName'}, 'method')

        let content = FinancialStatementDetails,
            date = {year: 2014, endPeriod: 12};

        if (savedFinancialStatementConf.data.length > 0 || Object.keys(savedFinancialStatementConf.data).length > 0){
            let [savedDate, savedContent] = savedFinancialStatementConf.data;
            content = savedContent;
            date = savedDate;
            console.log(content, date);
        }

        content = List.from(Object.entries(content))
            .map(([title, content]) => {
                let rec = financialConfHead.createRecord({title})
                rec.heir = List.from(content).map(con => financialConfHead.createRecord(con));
                return rec
            })
            .flat()

        dateHead.setColProp({colDesc: '起始年'}, 'year');
        dateHead.setColProp({colDesc: '截止期间'}, 'endPeriod');

        let sec1 = {
            head: dateHead,
            data: List.from([dateHead.createRecord(date)]),
            tableAttr: {
                editable: true
            }
        }
        console.log(sec1);

        let sec2 = {
            data: content,
            head: financialConfHead,
            tableAttr:{
                expandable: true,
                editable: true,
            }
        };

        return [sec1, sec2]
        // return [sec2];

    },
    exportProc(data){

        let [date, content] = data;

        let plainObject = content.data.slice().map(e => [
            e.cols.title,
            e.heir.map(r => r.cols)
        ]);
        
        let savedContent = Object.fromEntries(plainObject),
            savedDate = date.data[0].cols;
        
        return [savedDate, savedContent];
   },
    desc: '资产负债表配置表',
    type: 'CONF',
    isSavable: true
}