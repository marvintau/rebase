import {Record, List, Head, Sheet, Table} from 'persisted';

function withinDateRange(iyear, iperiod, dateRange){
    return (iperiod.valueOf() >= parseInt(dateRange.start.period)) && 
           (iperiod.valueOf() <= parseInt(dateRange.end.period)) &&
           (iyear.valueOf() >= parseInt(dateRange.start.year)) && 
           (iyear.valueOf() <= parseInt(dateRange.end.year));
}



let cateHead = new Head({
    ccode_name: 'String',
    ccode: 'String',
    cclass: 'String',
    iyear: 'String',
    iperiod: 'String',
    mb: 'Float',
    md: 'Float',
    mc: 'Float',
    me: 'Float',
})

cateHead.setColProp({colDesc: '科目'}, 'ccode_name')
cateHead.setColProp({colDesc: '科目代码', hidden: true}, 'ccode')
cateHead.setColProp({colDesc: '年', hidden: true}, 'iyear')
cateHead.setColProp({colDesc: '期间', hidden: true}, 'iperiod')
cateHead.setColProp({colDesc: '期初'}, 'mb')
cateHead.setColProp({colDesc: '借方'}, 'md')
cateHead.setColProp({colDesc: '贷方'}, 'mc')
cateHead.setColProp({colDesc: '期末'}, 'me')

let routeHead = new Head({
    ccode_name : 'String',
    ccode      : 'String',
    md         : 'Float',
    mc         : 'Float',
    iyear      : 'String',
    iperiod    : 'String'
})

let head = new Head({
    item:     'String',
    value:   'Float', 
})

head.setColProp({colDesc: '项目'}, 'item')
head.setColProp({colDesc: '金额'}, 'value')

const referred = {
    CashflowWorksheet: {desc: '现金流量表工作底稿', location: 'local'},
    BALANCE: {desc: '科目余额', location: 'remote'},
    JOURNAL: {desc: '序时账', location: 'remote'}
};

function deepReplace(list){
    for (let i = 0; i < list.length; i++){
        console.log(list[i]);
        list[i] = list[i].copy();
        deepReplace(list[i].heir)
    }
}

function backTraverse(list, func){
    for (let i = 0; i < list.length; i++){
        backTraverse(list[i].heir, func);
        list[i] = func(list[i]);
    }
}

function outer(listOfLists){

    if (listOfLists.some(elem => !Array.isArray(elem))){
        throw Error('outer必须得用在list of lists上')
    }

    // wrap the innermost level with list. note that the
    // value inside first should be a string in our use
    // case.
    let [first, ...rest] = listOfLists,
        res = first.map(e => [e]);

    // for every element from list, make it a list that
    // every existing list of res concat with it.
    for (let list of rest){
        res = res.map(e => list.map(l => e.concat(l))).flat();
    }

    return res;
}

function endBalance(mb, mc, md, cclass){
    let dir = {
        '资产' : '+',
        '负债' : '-',
        '权益' : '-',
        '共同' : '+',
        '损益' : '+',
        '成本' : '+'
    }[cclass];

    return eval(`${mb}${dir}(${md - mc})`)
}

function importProc({CashflowWorksheet, BALANCE, JOURNAL}){

    // console.log(CashflowWorksheet, 'whrksoee');
    let [dateSec, contentSec] = CashflowWorksheet.sections,
        worksheetContent = List.from(contentSec.data),
        {year, endPeriod} = dateSec.data[0].cols;

        year = 2015;
        endPeriod = 10;

    // 获得科目余额按科目的字典
    let balanceOfYear = List.from(BALANCE.data).map(e => new Record(e, {head: cateHead}))
        .grip(e => e.get('iyear'))
        .get(year)
        .grip(e => e.get('ccode'))
        .iter((key, recs) => {
            return recs[0].set('mc', 0).set('md', 0);
            // return recs[0];
        }).group;

    // console.log(balanceOfYear);
    
    // 获得期间内发生额按科目的字典
    let journalOfYear = List.from(JOURNAL.data).map(e => new Record(e, {head: routeHead}))
        .grip(e => e.get('iyear'))
        .get(year)
        .filter(e => e.get('iperiod') <= parseInt(endPeriod))
        .grip(e => e.get('ccode'))
        .iter((key, recs) => {
            return routeHead.sum(recs);
        }).group;

    for (let ccode in journalOfYear){
        balanceOfYear[ccode].set('mc', journalOfYear[ccode].get('mc'));
        balanceOfYear[ccode].set('md', journalOfYear[ccode].get('md'));

        let {mb, mc, md, cclass} = balanceOfYear[ccode].cols;
        balanceOfYear[ccode].set('me', endBalance(mb, mc, md, cclass));
    }

    let cascadedBalance = List.from(Object.values(balanceOfYear)).ordr(e => e.get('ccode'))
        .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
            let descCode = desc.get('ccode'),
                ancesCode = ances.get('ccode');
            return descCode.startsWith(ancesCode)
        });

    backTraverse(cascadedBalance, (rec) => {
        if (rec.heir.length > 0){
            rec.set('md', rec.heir.map(e => e.get('md')).reduce((acc, e) => acc+e))
            rec.set('mc', rec.heir.map(e => e.get('mc')).reduce((acc, e) => acc+e))

            let {mb, mc, md, cclass} = rec.cols;
            rec.set('me', endBalance(mb, mc, md, cclass));
        }

        return rec;
    })

    deepReplace(worksheetContent);

    let refs = {};
    backTraverse(worksheetContent, (rec) => {
        
        let {item, value} = rec.cols;
        value = value.valueOf().replace(/\s+/, '');

        if(value.startsWith('/')){
            let [refPath, refVal] = value.split(':'),
                pathSegs = refPath.split('/').slice(1).map(e => e.split('&'));
            
            let pathSegsOuter = outer(pathSegs);

            let destRecs = new List(0);
            for (let path of pathSegsOuter){

                let listRef = cascadedBalance, destRec;
                for (let elem of path){
                    destRec = listRef.find(e => e.get('ccode_name').valueOf() === elem);
                    if (destRec === undefined){
                        // console.log();
                        break;
                    }
                    // console.log(destRec.cols.ccode_name)
                    listRef = destRec.heir;
                }
                destRecs.push({path: path.join('/')+":"+refVal, item: destRec})
            }

            let res;
            if (destRecs.some(e => e.item === undefined)){
                res = {error: '未能取数'}
                // console.log(destRecs);
            } else {
                switch(refVal){
                    case '借方' : res = destRecs.map(e => e.item.get('md')); break;
                    case '贷方' : res = destRecs.map(e => e.item.get('mc')); break;
                    case '贷方-借方' : res = destRecs.map(e => e.item.get('mc') - e.item.get('md')); break;
                    case '借方-贷方' : res = destRecs.map(e => e.item.get('md') - e.item.get('mc')); break;
                    case '期初' : res = destRecs.map(e => e.item.get('mb')); break;
                    case '期末' : res = destRecs.map(e => e.item.get('me')); break;
                }

                if (res === undefined){
                    console.log(value, refVal);
                }

                res = res.reduce((acc, e) => acc+e, 0);

                if (item.valueOf() == '-'){
                    res = -res;
                }

            }

            return new Record({item: `${item} ${value}`, value: res}, {head})

        } else if (!Number.isNaN(parseFloat(value))){
            // 一个固定的数字
            return new Record({item, value: parseFloat(value)}, {head})
        } else {

            // 这里情况就复杂了，是一个表达式。需要具体分析。

            let [ref, refExpr] = value.split('@');
            if (refExpr === undefined){
                refExpr = ref;
                ref = undefined;
            } 
            // 我们现对表达式求值，如果存在ref就将值赋给ref
            let evaled, attr={};
            switch(refExpr){
                case 'SUMSUB': 
                    evaled = rec.heir.map(e => e.get('value'))
                        .filter(e => (!Number.isNaN(e)) && (!e.error))
                        .reduce((acc, e) => acc+e, 0);
                    // console.log(item, evaled);
                    break;
                case 'SUB1':
                    evaled = rec.heir[0].get('value');
                    console.log('SUB1', evaled, isNaN(evaled));
                    if (isNaN(evaled)){
                        evaled = 0;
                    }
                    break;
                case 'NONE':
                    evaled = {error: ''}
                    attr = {title: 'item'};
                    break;
                default :
                    if(refExpr.startsWith(':')){
                        evaled = eval(refExpr.substring(1).replace(/\$/g, 'refs.'));
                    } else {
                        // 不能识别的表达式统一设置为0
                        evaled = 0;
                    }
            }

            if(ref !== undefined){
                refs[ref] = evaled;
            }

            return new Record({item, value: evaled}, {head, heir:rec.heir, attr});            
        }
                
    })

    console.log(refs);

    
    return [
        {
            head,
            data: worksheetContent,
            tableAttr: {expandable: true, autoExpanded: true}
        },
        // {
        //     head: cateHead,
        //     data: cascadedBalance,
        //     tableAttr: {expandable: true,}
        // }
    ]
}


function exportProc(sections){
    return sections[0].data.flatten().map(e => {
        let {item, value} = e.cols;
        item = item.replace(/#/g, '');
        
        if(value.error){
            value = value.error;
        } else if (isNaN(value)){
            value = ''
        } else {
            value = parseFloat(value.toFixed(2));
        }

        return {item, value};
    });
}

export default function(){
    return new Sheet({
        desc: "改进的现金流量表",
        referred,
        importProc,
        exportProc,
        type: 'DATA',
        forceReload: true,
        isExportable: true
    })
}