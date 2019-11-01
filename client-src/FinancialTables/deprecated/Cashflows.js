import {Record, List, Head, Sheet, Table} from 'persisted';

import CashflowStatementDirectDetails from './local/cashflowStatementDirectDetails.txt.json';

let routeHead = new Head({
    ccode_name : 'String',
    ccode      : 'String',
    cclass     : 'String',
    mb         : 'Float',
    mc         : 'Float',
    md         : 'Float',
    me         : 'Float',
    iyear      : 'Integer',
    iperiod    : 'Integer'
})


function traceRecord(list, recKey, path){
    let listRef = list, ref;
    for (let node of path){
        // if (node === '全部') break;
        ref = listRef.find(rec => rec.get(recKey).valueOf() === node)
        if (ref === undefined) break;
        listRef = ref.heir;
    }
    return ref;
}

let head = new Head({
    mainTitle: 'String',
    title:     'String',
    accrual:   'Float', 
})

head.setColProp({colDesc: '类别', isTitle: true,}, 'mainTitle')
head.setColProp({colDesc: '项目', isExpandToggler: true}, 'title')
head.setColProp({colDesc: '金额'}, 'accrual')

const referred = {
    savedCashflowConf: {desc:'已保存的资产负债表配置表', location: 'remote', type: 'CONF'},
    RouteAnalysis: {desc:'发生额变动分析' , location:'local', type: 'DATA'}
};

function importProc({RouteAnalysis, savedCashflowConf}){
        
    let conf = CashflowStatementDirectDetails,
        date = {year: 2014, endPeriod: 12};
    if (savedCashflowConf.data.length > 0 || Object.keys(savedCashflowConf.data).length > 0){
        let [savedDate, savedConf] = savedCashflowConf.data;
        conf = savedConf;
        date = savedDate;
    }
    console.log(date, conf, 'initialLoaded')


    // 打开之前获取的发生额分析数据，获取配置表中对应年份
    let routeData = RouteAnalysis.sections.data;
    
    // 先获取期间范围内的余额数据。前提是年份存在的情况下。在我们遇到的数据中，存在
    // 导出的.BAK文件中没有iyear字段的情况。以下是一个workaround，如果发现原始数据
    // 中没有会计年的字段，就不对期间进行筛选了。

    // 和FinancialStatement类似，但是发生额变动是一个本地的数据表，格式和远程的原始
    // 数据不一样。通常序时账中会包含全部的信息，但我们在此处也同样做一个处理。如果
    // 发生额变动是一个List而非Group，说明在形成发生额变动的时候并没有按年分组，那
    // 么就略过年份选择。但是在序时账中期间通常是（而且必须是）存在的，因此在这里就不对
    // iperiod做更多分析了。

    if (routeData.keys()[0] != 0){
        routeData = routeData.get(date.year);
    } else {
        routeData = routeData.get(0);
    }

    console.log(routeData, 'beforeFlatten');
    routeData = routeData
    .flatten()

    // 然后获取我们想要的区间
    .filter(e => {
        let {iperiod} = e.cols;
        return iperiod <= date.endPeriod
    })

    // 将条目按科目分类，并在想要的时间区间内求和
    .grip(e => e.get('ccode'), '科目')
    .iter((key, val) => {
        let sorted = val.ordr(e => `${e.get('iyear')-e.get('iperiod')}`).reverse();
        return routeHead.sum(sorted);
    })
    .grap()

    // 然后建立一个级联的经过求和的科目发生额表
    .ordr(e => e.get('ccode'))
    .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
        let descCode = desc.get('ccode'),
            ancesCode = ances.get('ccode');
        return descCode.slice(0, ancesCode.length).includes(ancesCode)
    });
    console.log(routeData, 'routes')
    
    // 现在计算发生额
    conf = List.from(Object.entries(conf))
    .map(([mainTitle, headContent]) => {

        let headRec = new Record({mainTitle, title: '', accrual: 0}, {head});

        let headContentRec = Object.entries(headContent).map(([title, content]) => {

            let accrual = 0;
            console.log(content, 'beforemap');
            let entries = content.map(entry => {

                let [_, ...path] = entry.category;
                let rec = traceRecord(routeData, 'ccode_name', path);

                // 如果配置文件是导入的，那么很可能会找不到实际的科目，那么在实际计算的过程中，
                // 我们将会排除掉这些科目。
                if (rec === undefined){
                    return rec;
                }

                return {...entry, ...rec.valueOf()}
            }).filter(rec => rec !== undefined)
            
            let heir = new List(0);
            for (let rec of entries){
                let {method, side, category} = rec;

                side = side[1];
                method = method[1];

                let key = {
                    '期初' : 'mb',
                    '借方' : 'md',
                    '贷方' : 'mc',
                    '期末' : 'me'
                }[side]

                let sign = {
                    '计入' : '+',
                    '减去' : '-',
                    '' : '+'
                }[method];

                console.log('finalValue', `${sign}(${rec[key]})`);
                let finalValue = eval(`${sign}(${rec[key]})`);

                let [_, ...path] = category;
                heir.push(new Record({
                    title: `${method} ${path.join('-')} ${side}`,
                    accrual: finalValue,
                }, {head}))

                accrual += finalValue;
            }

            return new Record({title, accrual}, {head, heir});
        });

        let sum = headContentRec.map(e => e.get('accrual')).reduce((e, acc) => e+acc, 0);
        console.log(sum, 'sum')

        return [headRec, ...headContentRec]
    }).flat(2);

    return {
        head,
        data: conf,
        tableAttr: {expandable: true}
    }
}

export default function(){
    return new Sheet({
        desc: "现金流量表",
        referred,
        importProc,
        type: 'DATA'
    })
}