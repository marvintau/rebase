import {Record, List, Head} from 'persisted';

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


export default{
    referred: {
        savedCashflowConf: {desc:'已保存的资产负债表配置表', location: 'remote', type: 'CONF'},
        RouteAnalysis: {desc:'发生额变动分析' , location:'local', type: 'DATA'}
    },
    importProc({RouteAnalysis, savedCashflowConf}){
        
        // let headYear = 0,
        //     tailYear = 0,
        //     headPeriod = 1,
        //     tailPeriod = 10;

        // 首先将之前的发生额分析完全展开
        let routeData = RouteAnalysis.data.grap().flatten()
        // // 然后获取我们想要的区间
        // // .filter(e => {
        // //     let {iyear, iperiod} = e.cols;
        // //     return (iyear >= headYear) && (iyear <= tailYear) && (iperiod >= headPeriod) && (iperiod <= tailPeriod)
        // // })

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
        // What we get so far:
        // similar to financial statement.
        // a cascaded list of records, that containing the beginning, accumulated
        // credit and debit accrual.
        console.log(routeData, 'routes')
        
        let data = CashflowStatementDirectDetails;
        if (savedCashflowConf.data.length > 0 || Object.keys(savedCashflowConf.data).length > 0){
            data = savedCashflowConf.data;
        }
        console.log(data, 'here')

        // 现在计算发生额
        data = List.from(Object.entries(data))
        .map(([mainTitle, headContent]) => {

            let headRec = new Record({mainTitle, title: '', accrual: 0}, {head});

            let headContentRec = Object.entries(headContent).map(([title, content]) => {

                let accrual = 0;
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

                    let finalValue = eval(`${sign}${rec[key]}`);

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

            return [headRec, ...headContentRec, new Record({title: '小计', accrual: sum}, {head})]
        }).flat(2);

        return {head, data, tableAttr: {expandable: true}}
    },
    desc: "现金流量表",
}
