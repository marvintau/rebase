import {Cols, Body, List, Head, Sheet, Table, WorkTable} from 'persisted';

let dateHead = new Head({
    year: 'String',
    startPeriod: 'String',
    endPeriod:   'String'
})

dateHead.setColProp({colDesc: '年'}, 'year');
dateHead.setColProp({colDesc: '起始期间'}, 'startPeriod');
dateHead.setColProp({colDesc: '截止期间'}, 'endPeriod');

// 以下的categoryHead和balanceHead都是不需要显示的
// 所以不需要写出中文名称。

let categoryHead = new Head({
    ccode: 'String',
    ccode_name : 'String'
})

let balanceHead = new Head({
    ccode: 'String',
    ccode_name: 'String',
    iyear: 'String',
    iperiod: 'String',
    mb: 'Number',
    md: 'Number',
    mc: 'Number',
    me: 'Number',
})

const handleSaved = (saved, defaultVal) => {
    if(saved.data.length > 0 || Object.keys(saved.data).length > 0){
        console.log(saved.data,'saved');
        return saved.data.content;
    } else {
        return defaultVal;
    }
}

function importProc({CASHFLOW_WORKSHEET, BALANCE, CategoricalAccruals, savedCashflowWorksheet}){

    let worksheetData = handleSaved(savedCashflowWorksheet, CASHFLOW_WORKSHEET.data);

    // 注意，这是一个temporarily patch，当下一次进行完整的测试流程后，应当删去此处，
    // 这部分的数据处理是在后端上传时进行的。不应该出现在这里。
    for (let i = 0; i < BALANCE.data.length; i++) {
        if (BALANCE.data[i].iperiod === undefined){
            BALANCE.data[i].iperiod = 0;
        }
    }

    let balanceData = balanceHead.createBody(BALANCE.data),
        cates = categoryHead.createBody(BALANCE.data).uniq('ccode').cascade('ccode');

    let {head: accrualHead, data:accrualData} = CategoricalAccruals.tables;

    // the the balance of period according to the given month.
    // 注意 | Caution
    // =====
    // 如果balance中并没有指明期间，我们在上传数据的时候已经将balance中的期间自动设为0
    // 然而仍然存在可能性，balance中仅包含一个期间，且不为0。我们不应当自动处理这类情况
    // 而是要将处理办法告知使用者，并且尽可能要求他们上传数据的时候添加合适的期间。

    console.log(balanceData, 'balanceData');

    // 将整个年度各期间内各科目的发生额求和，得到的是整个年度内不同科目下的发生额
    // 在这里再次注意一下，发生额是根据在序时账中出现的科目来汇总的，因此
    // 1) 不一定包含所有科目余额表中的科目
    // 2) 所有的科目均为末级科目
    let summedAccrual = accrualData.map(e => {
        let sum = accrualHead.sum(e.subs);
        
        let {ccode, ccode_name} = e.cols;
        Object.assign(sum.cols, {ccode,ccode_name});
        return sum;
    })

    // 把发生额添加到科目余额表中
    while(summedAccrual.length > 0){

        let codeMatch = (codeA, codeB) => (codeA.valueOf() === codeB.valueOf());

        let summedAccrualEntry = summedAccrual.pop(),
            {mc, md, ccode} = summedAccrualEntry.cols,
            balanceCate = balanceData.find(e => e.get('ccode').valueOf() === ccode.valueOf())

        if(balanceCate !== undefined){
            Object.assign(balanceCate.cols, {mc, md});
        }
    }

    // 由于科目余额表中只有末级科目的发生额被更新，这步操作会更新所有更高级的科目
    // 更新之后就会得到各级包含发生额的科目余额表。
    balanceData = balanceData
        .cascade('ccode')
        .backTraverse((rec) => {
            if (rec.subs.length > 0){
                let {mc, md} = rec.subs
                    .map(({cols:{mc, md}}) => ({mc, md}))
                    .reduce((acc, e) => ({mc:acc.mc+e.mc, md:acc.md+e.md}), {mc:0, md:0})
                Object.assign(rec.cols, {mc, md});
            }
            return rec;
        })

    // Then we initialize the worksheet. Since the parse procedure has been
    // specified in the worksheet, the worktable object will be created in the beginning.
    let workTable = new WorkTable(balanceData, cates, {editable: true, expandable: true, autoExpanded: true});
    workTable.parse(worksheetData);
    workTable.evaluate();
    console.log(workTable);

    return  workTable;
}

function exportProc(tables){
    
    let contentSec = tables;

    let flattened = contentSec.data.flatten(),
        savedContent = flattened.map(e => {
            let {desc: item, string: value, value:result} = e.cols.value;
            return {item, value, result}
        }),
        savedValue = flattened
        .filter(e => e.subs.length > 0)
        .map(e => {
            let {desc: item, value} = e.cols.value;
            return {item:item.replace(/#/g, ''), value}
        })

    return {
        content: savedContent,
        values: savedValue
    }
}

export default function(){ 
    return new Sheet({
        referred: {
            CASHFLOW_WORKSHEET: {desc: '现金流量表底稿', location: 'remote'},
            BALANCE: {desc: '科目余额', location: 'remote'},
            CategoricalAccruals: {desc: '科目发生额', location: 'local'},
            savedCashflowWorksheet: {desc: '已保存的现金流底稿模版', location:'remote', type:'CONF'}
        },
        importProc,
        exportProc,
        desc: '现金流量表',
        type: 'CONF',
        isSavable: true,
        isExportable: true
    })
}