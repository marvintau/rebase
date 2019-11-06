import {Cols, Body, Head, Sheet, Table} from 'persisted';

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
    endPeriod:   'String'
})

dateHead.setColProp({colDesc: '年'}, 'year');
dateHead.setColProp({colDesc: '起始期间'}, 'startPeriod');
dateHead.setColProp({colDesc: '截止期间'}, 'endPeriod');

function parseTableData(cashflowWorksheetData){

    console.log(cashflowWorksheetData);

    const getTitleLevel = (rec) => {
        return (rec.get('item').match(/#/g) || []).length
    };

    const isTitle = (rec) => {
        return rec.get('item').startsWith('#')
    };

    let error;

    let data = new Body(0);
    for (let i = 0; i < cashflowWorksheetData.length; i++){
        let rec = new Cols(cashflowWorksheetData[i], {head: worksheetHead});
        rec.attr = isTitle(rec) ? {title: 'item'} : {};

        let listRef = data;
        while(listRef.length > 0){
            let titles = listRef.map(rec => isTitle(rec));

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

            // 如果发现不是title，那么listRef应该停留在当前title的subs上而不继续深入查找。
            if(!isTitle(listRef.last())){
                break;
            }

            listRef = listRef.last().subs;
        }

        // if(error !== undefined) {
        //     return {error}
        // }
        // console.log(listRef);
        listRef.push(rec);
    }
    return data;
}

function importProc({CASHFLOW_WORKSHEET, BALANCE, savedCashflowWorksheet}){

    let balanceData = BALANCE.data;

    let cates = categoryHead.createBody(balanceData)
        .uniq('ccode')
        .cascade('ccode');

    worksheetHead.setColProp({colDesc:'项目'}, 'item');
    worksheetHead.setColProp({colDesc:'对应值', paths:cates}, 'value');

    let cashflowWorksheetData, date;
    if(savedCashflowWorksheet.data.length > 0 || Object.keys(savedCashflowWorksheet.data).length > 0){
        let {date: savedDate, content: savedContent} = savedCashflowWorksheet.data;
        console.log(savedDate, 'saved');
        cashflowWorksheetData = parseTableData(savedContent);
        date = dateHead.createBody([savedDate])
    } else {
        console.log(CASHFLOW_WORKSHEET)
        cashflowWorksheetData = parseTableData(CASHFLOW_WORKSHEET.data);
        date = dateHead.createBody([{year: 2014, startPeriod: 0, endPeriod: 15}])
    }

    if (cashflowWorksheetData.error){
        // error handeling
        return new Table(worksheetHead, new Body(0), {});
    }

    return [
        new Table(dateHead, date, {editable: true}),
        new Table(worksheetHead, cashflowWorksheetData, {expandable: true, autoExpanded: true, editable: true})
    ]    

}

function exportProc(tables){
    
    let [dateSec, contentSec] = tables;

    let savedDate = dateSec.data[0].cols,
        savedContent = contentSec.data.flatten().map(e => {
            let {item, value} = e.cols;
            return {item, value:value.string}
        });

    return {
        date: savedDate,
        content: savedContent
    }
}

export default function(){ 
    return new Sheet({
        referred: {
            CASHFLOW_WORKSHEET: {desc: '现金流表底稿', location:'remote'},
            BALANCE: {desc: '科目余额', location:'remote'},
            savedCashflowWorksheet: {desc: '已保存的现金流底稿模版', location:'remote', type:'CONF'}
        },
        importProc,
        exportProc,
        desc: '现金流量表底稿',
        type: 'CONF',
        isSavable: true,
        isExportable: true
    })
}