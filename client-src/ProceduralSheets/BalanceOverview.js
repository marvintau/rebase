import {Header, Record, List} from 'mutated';

export default {
    referred: {
        BALANCE: {desc:'科目余额', location:'remote'}
    },
    importProc({BALANCE}, logger){

        let head = new Header(
            {cellType: "Display", cellStyle:"display", colKey: 'ccode_name', colDesc: "科目名称", expandControl: true},
            {cellType: "Display", cellStyle:"display", colKey: 'ccode', colDesc: "科目编码"},
            {cellType: "Display", cellStyle:"display", colKey: 'cclass', colDesc: "科目类别", type: 'String'},
            {cellType: "Display", cellStyle:"display", colKey: 'mb', colDesc: '期初金额', type: 'Number'},
            {cellType: "Display", cellStyle:"display", colKey: 'me', colDesc: '期末金额', type: 'Number'}
        );

        let balanceData = (new List(...BALANCE.data)).map(e => new Record(e));
        let data = balanceData
            .grip(rec => rec.get('iyear'), '年')
            .iter((key, recs) => {
                return recs
                    .grip((rec) => rec.get('iperiod'), '期间')
                    .iter((key, codeRecs) => {
                        return codeRecs
                            .tros(e => e.get('ccode'))
                            .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
                                let descCode = desc.get('ccode'),
                                    ancesCode = ances.get('ccode');
                                return descCode.slice(0, ancesCode.length).includes(ancesCode)
                            }, '按科目级联');
                    }, '科目')
            });

            console.log(balanceData, 'balanceData');

        return {head, data, tableAttr:{expandable: true, editable:true}};
    },
    desc: '每期间科目余额',
    type: 'DATA',
}