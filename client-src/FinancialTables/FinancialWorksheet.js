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
        return saved.data;
    } else {
        return defaultVal;
    }
}

const getYear = (body, year) => {
    let keys = body.keys();
    if(keys.length === 1 && keys[0] == '0'){
        return body.get('0');
    } else {
        return body.get(year);
    }
}

function importProc({FINANCIAL_WORKSHEET, BALANCE, CategoricalAccruals, savedFinancialWorksheet}){

    // 处理预先保存的数据，并获取日期。date
    let {content: worksheetData, date} = handleSaved(savedFinancialWorksheet, {
        date: {year: 2014, startPeriod: 0, endPeriod: 15},
        content: FINANCIAL_WORKSHEET.data
    });

    let {year, startPeriod, endPeriod} = date;

    // First we process hte accrual and balance data until it can be accepted by 
    // worktable object.

    // 注意，这是一个temporarily patch，当下一次进行完整的测试流程后，应当删去此处，
    // 这部分的数据处理是在后端上传时进行的。不应该出现在这里。
    for (let i = 0; i < BALANCE.data.length; i++) {
        if (BALANCE.data[i].iperiod === undefined){
            BALANCE.data[i].iperiod = 0;
        }
    }

    // the original data.
    let balanceData = balanceHead.createBody(BALANCE.data),
        cates = categoryHead.createBody(BALANCE.data).uniq('ccode').cascade('ccode');
    // annual data of accrual & balance.
    let balanceOfYear = balanceData.grip('iyear', {});
        balanceOfYear = getYear(balanceOfYear, year).grip('iperiod', {});

    let accrualOfYear = CategoricalAccruals.tables.data.get(year),
        accrualHead = CategoricalAccruals.tables.head;

    // the the balance of period according to the given month.
    // 注意 | Caution
    // =====
    // 如果balance中并没有指明期间，我们在上传数据的时候已经将balance中的期间自动设为0
    // 然而仍然存在可能性，balance中仅包含一个期间，且不为0。我们不应当自动处理这类情况
    // 而是要将处理办法告知使用者，并且尽可能要求他们上传数据的时候添加合适的期间。

    console.log(balanceOfYear);

    let {max:lastKey, min:firstKey} = new List(...balanceOfYear.keys())
        .filter(e => {
            let int = parseInt(e);
            console.log(e, int, startPeriod, endPeriod);
            return int >= startPeriod && int <= endPeriod
        })
        .minMax();
    let balanceLastPeriod  = balanceOfYear.get(lastKey),
        balanceFirstPeriod = balanceOfYear.get(firstKey);

    console.log(lastKey, firstKey, 'lastfirst')
    console.log(balanceLastPeriod, 'lastperiod');

    // the summed categorical accrual for of last period
    let accrualWithinPeriod = accrualOfYear.map(e => {
        let {ccode, ccode_name} = e.cols;
        let vouchersWithinRange = e.subs.filter(e => e.get('iperiod') <= parseInt(endPeriod));
        let sum = accrualHead.sum(vouchersWithinRange);
        sum.cols.ccode = ccode;
        sum.cols.ccode_name = ccode_name;
        return sum;
    })

    // add the summed accrual to balance. So we will get the initial balance from the
    // first period, the accrual of both debit, credit, and the ending from the last period.
    while(accrualWithinPeriod.length > 0){

        let codeMatch = (codeA, codeB) => (codeA.valueOf() == codeB.valueOf());

        let accrualCateSum = accrualWithinPeriod.pop(),
            {mc, md, ccode} = accrualCateSum.cols,
            balanceCate = balanceLastPeriod.find(e => codeMatch(e.cols.ccode, ccode)),//.find(e => e.cols.ccode == ccode);
            mb = balanceFirstPeriod.find(e => codeMatch(e.cols.ccode, ccode)).cols.mb;
        Object.assign(balanceCate.cols, {mb, mc, md});
    }

    // make the balance cascaded, and get the summed balance of each category level. After
    // this step, the balanceLastPeriod will be accepted by worktable as referred data.
    balanceLastPeriod = balanceLastPeriod
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
    let workTable = new WorkTable(balanceLastPeriod, cates, {editable: true, expandable: true, autoExpanded: true});
    workTable.parse(worksheetData);
    workTable.evaluate();
    console.log(workTable);

    return [
        new Table(dateHead, dateHead.createBody([date]), {editable: true}),
        workTable
    ]    
}

function exportProc(tables){
    
    let [dateSec, contentSec] = tables;

    let savedDate = dateSec.data[0].cols,
        savedContent = contentSec.data.flatten().map(e => {
            let {desc: item, string: value} = e.cols.value;
            return {item, value}
        });

    return {
        date: savedDate,
        content: savedContent
    }
}

export default function(){ 
    return new Sheet({
        referred: {
            FINANCIAL_WORKSHEET: {desc: '资产负债表底稿', location: 'remote'},
            BALANCE: {desc: '科目余额', location: 'remote'},
            CategoricalAccruals: {desc: '科目发生额', location: 'local'},
            savedFinancialWorksheet: {desc: '已保存的资产负债表', location:'remote', type:'CONF'}
        },
        importProc,
        exportProc,
        desc: '资产负债表',
        type: 'CONF',
        isSavable: true,
        isExportable: true
    })
}