import {Record, List, Head, Sheet, Table} from 'persisted';

let worksheetHead = new Head({
    item: 'String',
    value: 'RefString'
})

let categoryHead = new Head({
    ccode: 'String',
    ccode_name : 'String'
})

let dateHead = new Head({
    year: 'String',
    startPeriod: 'String',
    endPeriod: 'String'
})
dateHead.setColProp({colDesc: '年'}, 'year');
dateHead.setColProp({colDesc: '起始期间'}, 'startPeriod');
dateHead.setColProp({colDesc: '截止期间'}, 'endPeriod');

function parseTableData(cashflowWorksheetData){
    const getTitleLevel = (rec) => {
        return (rec.get('item').match(/#/g) || []).length
    };

    const isTitle = (rec) => {
        return rec.get('item').startsWith('#')
    };

    let error;

    // console.log(cashflowWorksheetData, 'parse')

    let data = new List(0);
    for (let i = 0; i < cashflowWorksheetData.length; i++){
        let rec = new Record(cashflowWorksheetData[i], {head: worksheetHead});
        rec.attr = isTitle(rec) ? {title: 'item'} : {};

        let listRef = data;
        while(listRef.length > 0){
            let titles = data.map(rec => isTitle(rec));

            // 我们首先需要检查，一条记录的子表内的记录，要么都是title要么都不是，如果存在
            // title和非title混合的情况，则认为非法。需要停止while和for循环，返回错误信息。
            if(!titles.every(e => e) && titles.some(e => e)){
                error = 'not all titles in same level';
                break;
            }

            // 进行检查之后，如果当前记录是一个title，那么去比较list最后一个记录的标题层级
            // 如果找到了同一层级，就不再向下继续查找了。停止while循环。
            if(isTitle(rec) && getTitleLevel(rec) === getTitleLevel(listRef.last())){
                break;
            }

            // 如果发现不是title，那么listRef应该停留在当前title的heir上而不继续深入查找。
            if(!isTitle(listRef.last())){
                break;
            }

            listRef = listRef.last().heir;
        }

        if(error !== undefined) {
            return {error}
        }

        listRef.push(rec);
    }
    return data;
}

function importProc({CASHFLOW_WORKSHEET, BALANCE, savedCashflowWorksheet}){

    let balanceData = BALANCE.data;

    let cates = List.from(balanceData.map(e => new Record(e, {head: categoryHead})))
        .uniq(e => e.get('ccode'))
        .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
            let descCode = desc.get('ccode'),
                ancesCode = ances.get('ccode');
            return descCode.startsWith(ancesCode)
        });


    worksheetHead.setColProp({colDesc:'项目'}, 'item');
    worksheetHead.setColProp({colDesc:'对应值', paths:cates}, 'value');

    let cashflowWorksheetData, date;
    if(savedCashflowWorksheet.data.length > 0 || Object.keys(savedCashflowWorksheet.data).length > 0){
        let {date: savedDate, content: savedContent} = savedCashflowWorksheet.data;
        console.log(savedDate, 'saved');
        cashflowWorksheetData = parseTableData(savedContent);
        date = List.from([new Record(savedDate, {head: dateHead})]);
    } else {
        console.log(CASHFLOW_WORKSHEET)
        cashflowWorksheetData = parseTableData(CASHFLOW_WORKSHEET.data);
        date = [
            {year: 2014, startPeriod: 1, endPeriod: 15},
        ];
        date = List.from(date.map(e => new Record(e, {head: dateHead})));
    }

    console.log(cashflowWorksheetData, 'cashflowWorkSheet');

    if (cashflowWorksheetData.error){
        // error handeling
        return new Table(worksheetHead, new List(0), {});
    }

    return [
        new Table(dateHead, date, {editable: true}),
        new Table(worksheetHead, cashflowWorksheetData, {expandable: true, autoExpanded: true, editable: true})
    ]    

}

function exportProc(sections){
    
    let [dateSec, contentSec] = sections;

    let savedDate = dateSec.data[0].cols,
        savedContent = contentSec.data.flatten().map(e => e.cols);

    return {
        date: savedDate,
        content: savedContent
    }
}

export default function(){ 
    return new Sheet({
        referred: {
            CASHFLOW_WORKSHEET: {desc: '现金流表底稿模版', location:'remote'},
            BALANCE: {desc: '科目余额', location:'remote'},
            savedCashflowWorksheet: {desc: '已保存的现金流底稿模版', location:'remote', type:'CONF'}
        },
        importProc,
        exportProc,
        desc: '现金流量表工作底稿',
        type: 'CONF',
        isSavable: true,
        isExportable: true
    })
}