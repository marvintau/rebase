import {Head, Record, List, Sheet, Table} from 'persisted';

let head = new Head({
    ccode_name: 'String',
    ccode:      'String',
    cclass:     'String',
    mb:         'Float',
    me:         'Float',
    iperiod:    'String',
    iyear:      'String'
})

head.setColProp({colDesc: "年", hidden: true}, 'iyear')
head.setColProp({colDesc: "期间", hidden: true}, 'iperiod')
head.setColProp({colDesc: "科目名称", isExpandToggler: true}, 'ccode_name')
head.setColProp({colDesc: "科目编码"}, 'ccode' )
head.setColProp({colDesc: "科目类别"}, 'cclass')
head.setColProp({colDesc: '期初金额', isSortable: true}, 'mb'    )
head.setColProp({colDesc: '期末金额', isSortable: true}, 'me'    )

function importProc({BALANCE}){

    // console.log(BALANCE.data.constructor, 'balance type');
    let balanceData = List.from(BALANCE.data)
        .map(entry => head.createRecord(entry))
        .uniq(entry => `${entry.get('ccode')}-${entry.get('iperiod')}-${entry.get('iyear')}`);
    let data = balanceData
        .grip(rec => rec.get('iyear'), {desc:'年'})
        .iter((key, recs) => {

            let cas = (recs) => recs
                .ordr(rec=>rec.get('ccode'))
                .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
                    let descCode = desc.get('ccode'),
                        ancesCode = ances.get('ccode');
                    return descCode.startsWith(ancesCode)
                });

            if (recs.map(rec => rec.get('iperiod')).every(e => e=== undefined)){
                return cas(recs);
            } else {
                return recs
                    .grip((rec) => rec.get('iperiod'), {desc: '期间'})
                    .iter((key, codeRecs) => {
                        return cas(codeRecs);
                    })
            }

        });

    console.log(data, 'balance');

    return new Table(head, data, {expandable: true, editable:true});
}



export default function(){
    return new Sheet ({
        referred: {
            BALANCE: {desc:'科目余额', location:'remote'}
        },
        importProc,
        desc: '每期间科目余额',
        type: 'DATA',
    })
}