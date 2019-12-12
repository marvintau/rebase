import {Cols, Body, List, Head, Table, Sheet} from 'persisted';

let balanceHead = new Head({
    ccode: 'String',
    ccode_name: 'String'
})

let head = new Head({
    ccode_name:  'String',
    ccode:       'String',
    iyear:       'String',
    iperiod:     'String',
    ino_id:      'String',
    inid:        'String',
    cCusName:    'String',
    ccode_equal: 'MultiLine',
    cdigest:     'String',
    md:          'Number',
    mc:          'Number',
});

head.setColProp({colDesc: '凭证编号', isSortable: true}, 'ino_id');
head.setColProp({colDesc: '行', isSortable: true}, 'inid');
head.setColProp({colDesc: '科目名称'}, 'ccode_name');
head.setColProp({colDesc: '科目编码', hidden: true}, 'ccode');
head.setColProp({colDesc: '客户名称', hidden: true}, 'cCusName');
head.setColProp({colDesc: '对方科目'}, 'ccode_equal');
head.setColProp({colDesc: '摘要'},     'cdigest');
head.setColProp({colDesc: '借方发生', isSortable: true}, 'md');
head.setColProp({colDesc: '贷方发生', isSortable: true}, 'mc');
head.setColProp({colDesc: '期间'}, 'iperiod');
head.setColProp({colDesc: '年', hidden: true}, 'iyear');

function makeBackwardReference(listOfList){
    let backward = new Body(0);

    for (let outerIndex = 0; outerIndex < listOfList.length; outerIndex++){

        let innerList = listOfList[outerIndex];
        for (let innerIndex = 0; innerIndex < innerList.length; innerIndex++){
            let rec = innerList[innerIndex];
            rec.subs = innerList;
            backward.push(rec);
        }
    }

    return backward;
}

function importProc({JOURNAL, BALANCE}){

    let cascaded = balanceHead.createBody(BALANCE.data).cascade('ccode'),
        paths = cascaded.flattenPath();

    console.log(paths.length);
    console.time('catePath1');
    let catePathDict = {};
    for (let i = 0; i < paths.length; i++){
        let path = paths[i];
        if (path.length === 1){
            let {ccode, ccode_name} = path[0].cols;
            catePathDict[ccode] = ccode_name;
            catePathDict[ccode_name] = ccode_name;
        } else {
            let {ccode_name:leafName, ccode:leafCode} = path[0].cols,
                {ccode_name:rootName} = path.last().cols,
                joined = `${rootName}→${leafName}`;
            catePathDict[leafCode] = joined;
            catePathDict[leafName] = joined;
        }
    }

    for (let i = 0; i < cascaded.length; i++){
        let {ccode, ccode_name} = cascaded[i].cols;
        catePathDict[ccode] = catePathDict[ccode_name] = ccode_name;
    }
    console.timeEnd('catePath1');

    let data = head.createBody(JOURNAL.data);

    for (let i = 0; i < data.length; i++){
        let ccode_equal = data[i].get('ccode_equal');
        if (ccode_equal !== undefined){
            ccode_equal.setLines((e)=>catePathDict[e])
        }
    }


    let voucherList = data
        .grip(route => `${route.get('iperiod')}-${route.get('ino_id')}`, 'by-voucher-id')
        .vals();

        // voucherList现在是一个list of list，其中每个子层list是凭证。现在要将凭证中的
        // 每一行抽出来作为索引，然后将子层list作为其child。需要注意的是我们此时建立了
        // 一个循环引用。因为子层list里面的每个凭证行的child还是这个list自己。最终形成
        // 的是一个表。

    data = makeBackwardReference(voucherList)
        .grip(e => e.get('ccode'))
        .iter((key, val) => {
            let summed = head.sum(val);
            summed.subs = val;
            return summed;
        })
        .grap();

    console.log(data);

    return new Table(head, data, {expandable: true, rowswiseExportable: true});
}

export default function(){
    return new Sheet({
        referred: {
            JOURNAL: {desc: '序时账', location: 'remote'},
            BALANCE: {desc: '科目余额', location: 'remote'},
        },
        importProc,
        desc: '按科目重分类的明细',
        type: 'DATA',
        hidden: true,
    })
}