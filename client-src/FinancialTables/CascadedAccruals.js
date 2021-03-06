import {Head, Body, Table, Sheet} from 'persisted';

// head是科目发生额分析的表头
let head = new Head({
    iyear:       'String',
    iperiod:     'String',
    ccode_name : 'String',
    cclass:      'String',
    ccode :      'String',
    mb :         'Number',
    md :         'Number',
    mc :         'Number',
    me :         'Number',
})

head.setColProp({colDesc: "科目名称", isExpandToggler: true}, 'ccode_name');
head.setColProp({colDesc: "科目编码"}, 'ccode');
head.setColProp({colDesc: "科目类别"}, 'cclass');
head.setColProp({colDesc: '期初余额', isSortable: true}, 'mb');
head.setColProp({colDesc: '期末余额', isSortable: true}, 'me');
head.setColProp({colDesc: '借方发生', isSortable: true}, 'md');
head.setColProp({colDesc: '贷方发生', isSortable: true}, 'mc');
head.setColProp({colDesc: '年',}, 'iyear');
head.setColProp({colDesc: '期间',}, 'iperiod')

function importProc({BALANCE, CategoricalAccruals}){

    let {head: vHead, data: vData, attr:vAttr} = CategoricalAccruals.tables;

    let vDict = vData.grip('ccode')
        .iter((key, content) => {
            return new Table(vHead, content[0].subs, vAttr);
        })

    // 接下来我们首先获得每个期间的科目发生额，然后在对应期间内
    // 从上面的科目-凭证索引中找到所有期间内对应科目的凭证列表

    console.log(vDict, 'vdict');
    console.log(BALANCE.data);

    let balance = head.createBody(BALANCE.data)

    for (let i = 0; i < balance.length; i++){
        let ccode = balance[i].get('ccode');
        let vouchers = vDict.get(ccode);
        balance[i].subs = vouchers ? vouchers : new Body(0);
    }

    let data = balance
        .orderBy('ccode')
        .cascade('ccode');

    return new Table(head, data, {expandable: true, rowswiseExportable: true});
}

export default function(){
    return new Sheet({
        referred: {
            BALANCE: {desc: '科目余额', location: 'remote'},
            CategoricalAccruals: {desc: '按科目分类的发生额', location: 'local'},
        },
        importProc,
        desc: '科目发生额',
        type: 'DATA',
    })
}