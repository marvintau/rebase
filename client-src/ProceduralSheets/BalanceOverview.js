
export default {
    referred: {
        BALANCE: {desc:'科目余额', location:'remote'}
    },
    proc({BALANCE}, logger){

        let head = [
            {colKey: 'ccode', name: "科目编码"},
            {colKey: 'ccode_name', name: "科目名称"},
            {colKey: 'cclass', name: "科目类别", attr:{type: 'String'}},
            {colKey: 'mb', name: '期初金额', attr:{sortable: true, type: 'Number'}},
            {colKey: 'me', name: '期末金额', attr:{sortable: true, type: 'Number'}}
        ];

        let balanceData = BALANCE.sheet.data;
        let data = balanceData
            .grip(rec => `${rec.get('iperiod')}-${rec.get('iyear')}`, logger, '期间')
            .iter((key, recs) => {
                return recs
                    .grip((rec) => rec.get('ccode'), logger, '科目')
                    .iter((key, codeRecs) => {
                        return codeRecs.sum(head);
                    }, logger, '科目')
                    .grap()
                    .reverse()
                    .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
                        let descCode = desc.get('ccode'),
                            ancesCode = ances.get('ccode');
                        return descCode.slice(0, ancesCode.length).includes(ancesCode)
                    }, logger, '按科目级联');
            }, logger, '期间');

        return {head, data};
    },
    desc: '每期间科目余额',
    type: 'DATA',
}