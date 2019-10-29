import {Record, List, Head, Sheet, Table} from 'persisted';

let worksheetHead = new Head({
    item: 'String',
    value: 'String'
})

worksheetHead.setColProp({colDesc:'项目'}, 'item');
worksheetHead.setColProp({colDesc:'对应值'}, 'value');

function importProc({CASHFLOW_WORKSHEET}){

    const getTitleLevel = (rec) => {
        return (rec.get('item').match(/#/g) || []).length
    };

    const isTitle = (rec) => {
        return rec.get('item').startsWith('#')
    };

    let isError = undefined;

    let cashflowWorksheetData = CASHFLOW_WORKSHEET.data;

    let data = new List(0);

    for (let i = 0; i < cashflowWorksheetData.length; i++){
        let rec = new Record(cashflowWorksheetData[i], {head: worksheetHead});
        rec.attr = isTitle(rec) ? {title: 'item'} : {};
        console.log(getTitleLevel(rec));

        let listRef = data;
        while(listRef.length > 0){
            let titles = data.map(rec => isTitle(rec));

            // 我们首先需要检查，一条记录的子表内的记录，要么都是title要么都不是，如果存在
            // title和非title混合的情况，则认为非法。需要停止while和for循环，返回错误信息。
            if(!titles.every(e => e) && titles.some(e => e)){
                isError = 'not all titles in same level';
                break;
            }

            // 进行检查之后，如果当前记录是一个title，那么去比较list最后一个记录的标题层级
            // 如果找到了同一层级，就不再向下继续查找了。停止while循环。
            if(isTitle(rec) && getTitleLevel(rec) === getTitleLevel(listRef.last())){
                console.log(rec, listRef.last(), getTitleLevel(rec), getTitleLevel(listRef.last()));
                break;
            }

            listRef = listRef.last().heir;
        }

        if(isError !== undefined) {
            break;
        }

        listRef.push(rec);
    }

    console.log(data, cashflowWorksheetData.length, 'cashflowWorkSheet');

    if (isError){

    } else {
        return new Table(worksheetHead, data, {expandable: true, autoExpanded: true});
    }

}

export default function(){ 
    return new Sheet({
        referred: {
            CASHFLOW_WORKSHEET: {desc: '现金流表底稿模版', location:'remote'}
        },
        importProc,
        // exportProc,
        desc: '现金流量表工作底稿',
        type: 'CONF',
        isSavable: true
    })
}