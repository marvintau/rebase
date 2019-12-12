import {Head, Cols, Body, List, Sheet, Table} from 'persisted';

let head = new Head({
    ccode_name: 'String',
    ccode:      'String',
    cclass:     'String',
    mb:         'Number',
    md:         'Number',
    mc:         'Number',
    me:         'Number',
    iperiod:    'String',
})

head.setColProp({colDesc: "期间", hidden: true}, 'iperiod')
head.setColProp({colDesc: "科目名称", isExpandToggler: true}, 'ccode_name')
head.setColProp({colDesc: "科目编码"}, 'ccode' )
head.setColProp({colDesc: "科目类别"}, 'cclass')
head.setColProp({colDesc: '期初金额', isSortable: true}, 'mb')
head.setColProp({colDesc: '借方发生', isSortable: true}, 'md')
head.setColProp({colDesc: '贷方发生', isSortable: true}, 'mc')
head.setColProp({colDesc: '期末金额', isSortable: true}, 'me')

function toNum(currencyString){
    if (currencyString === undefined){
        return 0;
    } else {
        return parseFloat(parseFloat(currencyString.replace(/,/g, '')).toFixed(2))
    }
}

// 我们目前还不会涉及到通过journal来推算每一月份的期初期末余额。但是未来可能会用到。
function processJournal(journalOriginal){
    let journalData = List.from(journalOriginal)
    .grip(rec => rec.iyear, {desc: '年'})
    .iter((year, recs) => {
        return recs.grip(rec => rec.iperiod, {desc: '期间'})
        .iter((period, recs) => {
            return recs.grip(rec => rec.ccode, {desc: '科目'})
            .iter((ccode, recs) => {
                let rec = Object.assign({}, recs[0]);
                rec.mc = recs.map(r => toNum(r.mc)).reduce((acc, e) => acc+e, 0);
                rec.md = recs.map(r => toNum(r.md)).reduce((acc, e) => acc+e, 0);
                rec.mc = parseFloat(rec.mc.toFixed(2));
                rec.md = parseFloat(rec.md.toFixed(2));
                return rec
            }).group
        }).group
    }).group

    return journalData;
}

function processSingleBalanceCode(balancePeriod, accrualPeriod, ccode){

    // Object.assign是shallow copy，需要先把它复制一份
    balancePeriod[ccode] = Object.assign({}, balancePeriod[ccode]);

    let curr = balancePeriod[ccode];
    // 把上期间的期末给这期间的期初
    curr.iperiod = iperiod;
    curr.mb = curr.me

    // 把本期间的发生额直接附到科目余额表里面来。
    // 如果本期的序时账里没有这个科目那么就设为0。
    curr.mc = accrualPeriod[ccode] ? accrualPeriod[ccode].mc : 0;
    curr.md = accrualPeriod[ccode] ? accrualPeriod[ccode].md : 0;

    // 接下来计算期末，按基础的公式。
    // 资产类： 期末 = 期初 + (借方-贷方)
    // 负债类： 期末 = 期初 - (借方-贷方)
    // 权益属于负债类，成本、共同、损益类都属于资产
    // 其中损益类理论上每月结转的结果应该是0，但即使结果不是0也不要紧
    
    // 往来科目只存在六种类别，分别是
    // 应收，预付，其他应收（归入资产类）
    // 应付，预收，其他应付（归入负债类）
    let classType = {
        '资产' : '+',
        '负债' : '-',
        '权益' : '-',
        '共同' : '+',
        '损益' : '+',
        '成本' : '+'
    };

    let direction = (cclass in classType)
        ? classType[cclass]
        : cclass !== '往来'
        ? '+'
        : ccode_name.match(/(应收|预付)/)
        ? '+' : '-'

    let {ccode_name, cclass, mc, md, mb} = curr;
    curr.me = eval(`${mb}${direction}(${md - mc})`);
}

function processPeriodicalBalance(balanceData, journalData){
    let periodicalBalances = balanceData
    .iter((year, recs) => {
        let journalOfYear = Object.entries(journalData[year]),
            balanceOfYear = recs.grip(rec => rec.ccode, {desc: '科目'})
            .iter((key, recs) => recs[0])
            .group;

        // 在这里我们用了一个技巧。因为我们已经不再决定使用余额表的期末数，而是通过
        // 序时账来计算。那么我们需要制造一个上年结转的余额，所以把全年的科目余额的
        // 各科目期初数附给了期末。然后用这个伪期末数来加每期的序时账来得到各期间的
        // 期初期末。

        for (let ccode in balanceOfYear){
            balanceOfYear[ccode].me = balanceOfYear[ccode].mb;
        }

        let periodicalBalances = journalOfYear.reduce((acc, journalOfMonth) => {
            let [iperiod, cates] = journalOfMonth;
            let balanceLastPeriod = acc.last(),
                balanceCurrPeriod = Object.assign({}, balanceLastPeriod);

            for (let ccode in balanceCurrPeriod){
                processSingleBalanceCode(balanceCurrPeriod, cates, ccode)
            }

            return acc.concat(balanceCurrPeriod);
        }, List.from([balanceOfYear])).slice(1)

        return periodicalBalances;
    }).grap();

    return periodicalBalances;
}

function periodicalBalanceCascaded(){
    
    let balanceData = List.from(BALANCE.data);
    for (let i = 0; i < balanceData.length; i++){
        balanceData[i].mb = toNum(balanceData[i].mb)
        balanceData[i].me = toNum(balanceData[i].me)
    }

    let journalData = processJournal(JOURNAL.data);
    let periodicalBalances = processPeriodicalBalance(balanceData, journalData);
        
    function backTraverse(list, func){
        for (let i = 0; i < list.length; i++){
            backTraverse(list[i].heir, func);
            func(list[i]);
        }
    }

    for (let i = 0; i < periodicalBalances.length; i++){
        periodicalBalances[i] = List.from(Object.values(periodicalBalances[i]))
        .map(e => new Record(e, {head}))
        .cascade(rec=>rec.get('ccode').length,
            (desc, ances) => {
                let descCode  = desc.get('ccode'),
                    ancesCode = ances.get('ccode');
                return descCode.startsWith(ancesCode);
            }
        )

        backTraverse(periodicalBalances[i], (rec) => {
            if(rec.heir.length > 0){
                rec.set('mb', rec.heir.reduce((acc, e) => acc + e.get('mb'), 0))
                rec.set('me', rec.heir.reduce((acc, e) => acc + e.get('me'), 0)) 
                rec.set('md', rec.heir.reduce((acc, e) => acc + e.get('md'), 0)) 
                rec.set('mc', rec.heir.reduce((acc, e) => acc + e.get('mc'), 0)) 
            }
        })
    }

    console.log(periodicalBalances);
    let data = periodicalBalances.flat().grip(e => `${e.get('iyear')}-${e.get('iperiod')}`, {desc: '期间'})

    return data;
}

function importProc({BALANCE, JOURNAL}){

    let data = head.createBody(BALANCE.data)
        .uniq(entry => `${entry.get('ccode')}-${entry.get('iperiod')}`)
        .orderBy('ccode').cascade('ccode');

    console.log(data, 'balance');

    return new Table(head, data, {expandable: true, editable:false, rowswiseExportable: true});
}

export default function(){
    return new Sheet ({
        referred: {
            BALANCE: {desc:'科目余额', location:'remote'},
            // JOURNAL: {desc: '序时账', location:'remote'}
        },
        importProc,
        desc: '科目余额',
        type: 'DATA',
    })
}