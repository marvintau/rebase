import {Record, List, Head, Sheet, Table} from 'persisted';

let worksheetHead = new Head({
    item: 'String',
    value: 'RefString'
})

let categoryHead = new Head({
    ccode: 'String',
    ccode_name : 'String'
})

function importProc({CASHFLOW_WORKSHEET, BALANCE}){

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
    

    const getTitleLevel = (rec) => {
        return (rec.get('item').match(/#/g) || []).length
    };

    const isTitle = (rec) => {
        return rec.get('item').startsWith('#')
    };

    let isTableFormatError = undefined;

    let cashflowWorksheetData = CASHFLOW_WORKSHEET.data;

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
                isTableFormatError = 'not all titles in same level';
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

        if(isTableFormatError !== undefined) {
            break;
        }

        listRef.push(rec);
    }

    console.log(data, cashflowWorksheetData.length, 'cashflowWorkSheet');

    if (isTableFormatError){

    } else {
        return new Table(worksheetHead, data, {expandable: true, autoExpanded: true, editable: true});
    }

}

export default function(){ 
    return new Sheet({
        referred: {
            CASHFLOW_WORKSHEET: {desc: '现金流表底稿模版', location:'remote'},
            BALANCE: {desc: '科目余额', location:'remote'}
        },
        importProc,
        // exportProc,
        desc: '现金流量表工作底稿',
        type: 'CONF',
        isSavable: true
    })
}