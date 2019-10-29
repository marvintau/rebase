import {Record, List, Head, Table, Sheet} from 'persisted';

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

function importProc({BALANCE, savedFinancialStatementConf}){

    // 首先我们获取报表模版。如果有保存的配置表，我们就load保存的配置表，
    // 如果没有，那么FinancialStatementDetails是一份原始的配置表。此处获
    // 得的savedDate和savedConf，分别是报表日期和配置内容。我们首先需要限
    // 定。报表的年份和截止期间。因此需要用savedDate来筛选余额数据。

    let conf = FinancialStatementDetails,
        date = {year: 2014, endPeriod: 12};

    if (savedFinancialStatementConf.data.length > 0 || Object.keys(savedFinancialStatementConf.data).length > 0){
        let [savedDate, savedConf] = savedFinancialStatementConf.data;
        conf = savedConf;
        date = savedDate;
        console.log(conf, date, 'initialLoaded');
    }

    let balanceData = List.from(BALANCE.data)
    .map(e => balanceHead.createRecord(e));

    // 先获取期间范围内的余额数据。前提是年份存在的情况下。在我们遇到的数据中，存在
    // 导出的.BAK文件中没有iyear字段的情况。以下是一个workaround，如果发现原始数据
    // 中没有会计年的字段，就不对期间进行筛选了。
    let {iyear: testYear, iperiod: testPeriod} = BALANCE.data[0];
    if ((testYear !== undefined) && (testYear != 0)){
        console.log(balanceData, 'year');
        balanceData = balanceData.grip(e => e.get('iyear')).get(date.year)
    }
    if (testPeriod !== undefined){
        balanceData = balanceData.filter(e => {
            let {iperiod} = e.cols;
            return iperiod <= date.endPeriod
        })
        console.log(balanceData, 'period');
    }

    // 先将数据按照科目分类，然后在每个科目内对所有期间的数据
    // （包括期初/期末，借方/贷方）进行累加求和
    balanceData = balanceData.grip(e => e.get('ccode'))
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
    console.log(balanceData, 'cascaded');

    // 现在来计算报表项目中所对应的金额
    conf = List.from(Object.entries(conf))
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

        // 由于我们的默认值是由会计人员给出，在实际的帐套中并不存在对应的名字，因此
        // 我们需要处理undefined，也就是帐套中没有找到对应记录的情形。
        
        let heir = new List(0);
        for (let rec of entries){
            let {method, side, category} = rec;

            side = side[1];
            method = method[1];

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

            let finalValue = eval(`${sign}(${rec[key]})`);

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

    console.log(conf, 'financialStatemenet items')

    return new Table(head, conf, {expandable: true})
}

export default function(){
    return new Sheet({
        referred: {
            savedFinancialStatementConf: {desc:'已保存的资产负债表配置表', location: 'remote', type: 'CONF'},
            BALANCE: {desc:'科目余额', location:'remote'}
        },
        importProc,
        desc: "资产负债表",
        type: 'DATA'
    })
}