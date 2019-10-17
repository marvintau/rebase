import {Record, List, Head} from 'persisted';

import FinancialStatementDetails from './local/financialStatementDetails.txt.json';

let balanceHead = new Head({
    'ccode_name' : 'String',
    'ccode': 'String',
    'cclass': 'String',
    'mb': 'Float',
    'mc': 'Float',
    'md': 'Float',
    'me': 'Float',
    'iyear': 'Integer',
    'iperiod' : 'Integer'
})

function traceRecord(list, recKey, path){
    let listRef = list,
        ref;
    for (let node of path){
        // console.log(listRef, 'listRef')
        ref = listRef.find(rec => rec.get(recKey).valueOf() === node)
        if (ref === undefined) break;
        listRef = ref.heir;
    }
    return ref;
}

let head = new Head({
    title: 'String',
    mb:    'Float',
    me:    'Float',
})

head.setColProp({colDesc: '项目', isExpandToggler: true}, 'title')
head.setColProp({colDesc: '对应项'}, 'corres')
head.setColProp({colDesc: '期初'}, 'mb')
head.setColProp({colDesc: '当前'}, 'me')

export default{
    referred: {
        savedFinancialStatementConf: {desc:'已保存的资产负债表配置表', location: 'remote', type: 'CONF'},
        BALANCE: {desc:'科目余额', location:'remote'}
    },
    importProc({BALANCE, savedFinancialStatementConf}){
        
        let headYear = 0,
            tailYear = 0,
            headPeriod = 1,
            tailPeriod = 10;

        // 先获取期间范围内的余额数据
        let balanceData = new List(BALANCE.data.map(e => balanceHead.createRecord(e)))
        .filter(e => {
            let {iyear, iperiod} = e.cols;
            return (iyear >= headYear) && (iyear <= tailYear) && (iperiod >= headPeriod) && (iperiod <= tailPeriod)
        })

        // 先将数据按照科目分类，然后在每个科目内对所有期间的数据
        // （包括期初/期末，借方/贷方）进行累加求和
        .grip(e => e.get('ccode'))
        .iter((key, val) => {
            let sorted = val.ordr(e => `${e.get('iyear')-e.get('iperiod')}`).reverse();
            return balanceHead.sum(sorted);
        }).grap()

        // 然后形成级联的数据
        .ordr(e => e.get('ccode'))
        .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
            let descCode = desc.get('ccode'),
                ancesCode = ances.get('ccode');
            return descCode.slice(0, ancesCode.length).includes(ancesCode)
        });
        // What we get so far:
        // a cascaded list of records, that containing the beginning, accumulated
        // credit and debit accrual.
        console.log(balanceData);
        let data = FinancialStatementDetails;
        if (savedFinancialStatementConf.data.length > 0 || Object.keys(savedFinancialStatementConf.data).length > 0){
            data = savedFinancialStatementConf.data;
        }

        // 现在来计算报表项目中所对应的金额
        data = new List(Object.entries(data))
        .map(([title, content]) => {

            let mb = 0, me = 0;

            // 这里通过conf表中给定的路径，到上面计算所得的balanceData中获取对应的数额
            let entries = content.map(entry => {

                // 这里我们需要特别handle，在这里我们需要解除掉数据外层的包装。
                // 在这个版本稳定之前，不要尝试修改这里。
                if (entry.valueOf){
                    entry = entry.valueOf();
                }

                let [_, ...path] = entry.category;
                let rec = traceRecord(balanceData, 'ccode_name', path);

                if (rec === undefined){
                    return rec;
                }

                return {...entry, ...rec.valueOf()}
            }).filter(rec => rec !== undefined)
            console.log(entries, 'entries');
            // 由于我们的默认值是由会计人员给出，在实际的帐套中并不存在对应的名字，因此
            // 我们需要处理undefined，也就是帐套中没有找到对应记录的情形。
            
            let heir = new List();
            for (let rec of entries){
                let {method, side, category} = rec;

                side = side[1];
                method = method[1];

                console.log({method, side, category}, 'recs')
                let key = {
                    '借方' : 'md',
                    '贷方' : 'mc',
                    '期初' : 'mb'
                }[side]

                let sign = {
                    '计入' : '+',
                    '减去' : '-',
                    '' : '+'
                }[method];

                console.log('eval', `${sign}${rec[key]}`);
                let finalValue = eval(`${sign}${rec[key]}`);

                let [_, ...path] = category;
                let newRec = {
                    title: `${method} ${path.join('-')} ${side}`,
                    mb:0, me: 0,
                }
                if (key === 'mb'){
                    newRec.mb = finalValue;
                } else {
                    newRec.me = finalValue;
                }
                heir.push(new Record(newRec, {head}))

                me += finalValue;
                if (key === 'mb'){
                    mb += finalValue;
                }
            }

            return new Record({title, mb, me}, {head, heir});
        })

        console.log(data, 'financialStatemenet items')

        return {head, data, tableAttr: {expandable: true}}
    },
    desc: "资产负债表",
}
