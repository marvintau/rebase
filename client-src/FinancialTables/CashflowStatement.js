import {Cols, Body, List, Head, Sheet, Table} from 'persisted';

let head = new Head({
    item:     'String',
    value:    'Number', 
})

head.setColProp({colDesc: '项目'}, 'item')
head.setColProp({colDesc: '金额'}, 'value')

const referred = {
    CashflowWorksheet: {desc: '现金流表底稿', location: 'local'},
    BalanceOverview: {desc: '科目余额', location: 'local'},
    CategoricalAccruals: {desc: '科目发生额', location: 'local'}
};


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

function importProc({CashflowWorksheet, BalanceOverview, CategoricalAccruals}){

    let [dateSec, contentSec] = CashflowWorksheet.tables,
        worksheetContent = Body.from(contentSec.data).copy(),
        {year, endPeriod} = dateSec.data[0].cols;

    let balanceOfYear = BalanceOverview.tables.data.get(year),
        accrualOfYear = CategoricalAccruals.tables.data.get(year),
        accrualHead = CategoricalAccruals.tables.head;

    console.log(accrualOfYear.map(e => e.cols), 'accrual year')
    
    let lastKey = List.from(balanceOfYear.keys()).filter(e => parseInt(e) < endPeriod).last(),
        balanceLastPeriod = balanceOfYear.get(lastKey);    

    let accrualWithinPeriod = accrualOfYear.map(e => {
        let {ccode, ccode_name} = e.cols;
        let vouchersWithinRange = e.subs.filter(e => e.get('iperiod') < parseInt(endPeriod));
        let sum = accrualHead.sum(vouchersWithinRange);
        sum.cols.ccode = ccode;
        sum.cols.ccode_name = ccode_name;
        return sum;
    })

    /**
     * 在进行取数和计算的过程之前，请特别注意：
     * 
     * CategoricalAccruals是从序时账中按科目汇总得到的结果，而一个期间内的序时账未必
     * 会cover到所有的科目。因此如果我们通过科目路径查询CategoricalAccruals时，如果
     * 没有得到结果，除了我们的科目路径有错，也有可能是因为这个期间内这个科目的发生额
     * 没有变化，因此CategoricalAccruals中没有相关的借贷记录。
     * 
     * 因此，我们通过BalanceLastPeriod来检查科目路径是否正确。如果科目路径正确，而对应的
     * CategoricalAccruals为undefined，就只可能是本期间此科目没有发生额。
     */

    let refs = {};
    worksheetContent.backTraverse((rec) => {
        
        let {item, value} = rec.cols;
        value = value.valueOf().replace(/\s+/, '');

        if(value.startsWith('/')){
            let [refPath, refVal] = value.split(':'),
                pathSegs = refPath.split('/').slice(1).map(e => e.split('&'));
            
            let pathSegsOutered = outer(pathSegs);
            let destRecs = new Body(0);

            for (let path of pathSegsOutered){
                
                // 处理本期没有发生额的情况
                let accrual = accrualWithinPeriod.find(e => e.get('ccode_name').valueOf() == path[path.length - 1].trim());
                if (accrual === undefined){
                    accrual = new Cols({mc: 0, md: 0}, {head: accrualHead});
                }
                destRecs.push({
                    path: path.join('/')+":"+refVal,
                    balance: balanceLastPeriod.findBy('ccode_name', path),
                    accrual
                })
            }

            let res;
            if (destRecs.some(e => e.balance === undefined)){
                res = {error: '未能取数'}
            } else {
                switch(refVal){
                    case '借方' : res = destRecs.map(e => e.accrual.get('md')); break;
                    case '贷方' : res = destRecs.map(e => e.accrual.get('mc')); break;
                    case '贷方-借方' : res = destRecs.map(e => e.accrual.get('mc') - e.accrual.get('md')); break;
                    case '借方-贷方' : res = destRecs.map(e => e.accrual.get('md') - e.accrual.get('mc')); break;
                    case '期初' : res = destRecs.map(e => e.balance.get('mb')); break;
                    case '期末' : res = destRecs.map(e => e.balance.get('me')); break;
                }

                if (res === undefined){
                    console.log(value, refVal);
                }

                res = res.reduce((acc, e) => acc+e, 0);

                if (item.valueOf() == '-'){
                    res = -res;
                }
            }

            return new Cols({item: `${item} ${value}`, value: res}, {head})

        } else if (!Number.isNaN(parseFloat(value))){

            return new Cols({item, value: parseFloat(value)}, {head})

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
                    evaled = rec.subs.map(e => e.get('value'))
                        .filter(e => !Number.isNaN(e) && (e.error === undefined));
                    evaled = evaled.reduce((acc, e) => acc+e, 0);
                    break;
                case 'SUB1':
                    evaled = rec.subs[0].get('value');
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
                    try {
                        evaled = eval(refExpr.replace(/\$/g, 'refs.'));
                        if(typeof evaled === 'boolean'){
                            evaled = {valid: evaled};
                        }
                    } catch (err) {
                        console.log(refExpr.replace(/\$/g, 'refs.'), 'not recognizable');
                        evaled = {error: '不能识别的表达式'};
                    }
            }

            if(ref !== undefined){
                refs[ref] = evaled;
            }

            return new Cols({item, value: evaled}, {head, subs:rec.subs, attr});            
        }
                
    })

    return new Table( head, worksheetContent, {expandable: true, autoExpanded: true});
}


function exportProc(tables){
    return tables.data.flatten().map(e => {
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
        desc: "现金流量表",
        referred,
        importProc,
        exportProc,
        type: 'DATA',
        forceReload: true,
        isExportable: true
    })
}