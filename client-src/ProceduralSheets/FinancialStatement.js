
let head = [
    {colKey: 'entry', name: '条目'},
    {colKey: 'mb', name: '期初金额', attr:{type: 'Number'}},
    {colKey: 'me', name: '期末金额', attr:{type: 'Number'}}
];

let data = [
]

export default{
    head,
    proc(){

    },
    // ops:[
    //     {name: 'ungroup', args: {referred: 'balance'}},
    //     {name: 'flat', args: {referred: 'balance'}},
    //     {name: 'flat', args: {referred: 'category'}},
    //     {name: 'copy', args: {sheetSpec: true, from: 'balance'}},
    //     {name: 'join', args: {
    //         sheetSpec: true,
    //         from: {fromTable:'category', fromCol:'ccode'},
    //         dest: {destTable:'curr', destCol:'ccode'}
    //     }},
    //     {name: 'group', args: {
    //         keyFunc: rec=>rec.iyear,
    //         groupDesc: '年份'
    //     }},
    //     {name: 'group', args: {
    //         keyFunc: rec => rec.corrClass,
    //         groupDesc: '报表科目',
    //         mapGroup: true,
    //         mapLevel: 0
    //     }},
    //     {name: 'sum', args: {
    //         sumFunc: (recs) => {
    //             let {corrClass, assigned} = recs[0];
    //             console.log(recs[0], 'sum');

    //             let rec = {entry: corrClass};
    //             rec.mb = recs.reduce((acc, e) => acc + e.mb * (assigned === 'add' ? 1: -1), 0);
    //             rec.me = recs.reduce((acc, e) => acc + e.me * (assigned === 'add' ? 1: -1), 0);
    //             rec.mc = recs.reduce((acc, e) => acc + e.mc * (assigned === 'add' ? 1: -1), 0);
    //             rec.md = recs.reduce((acc, e) => acc + e.md * (assigned === 'add' ? 1: -1), 0);
    //             return rec
    //         },
    //         mapGroup: true,
    //         mapLevel: 1,
    //     }},
    //     {name: 'ungroup', args:{
    //         mapGroup: true,
    //         mapLevel: 0
    //     }},
    //     {name: 'filter', args: {
    //         filterFunc: (e) => {
    //             return e.entry.split('-').length > 2
    //         },
    //         mapGroup: true,
    //         mapLevel: 0
    //     }},
    //     {name: 'map', args: {
    //         mapFunc: ({entry,...rest}) => {
    //             return {entry: entry.split('-').slice(1), ...rest}
    //         },
    //         mapGroup: true,
    //         mapLevel: 0
    //     }},
    //     {name: 'group', args: {
    //         groupDesc: '类别',
    //         keyFunc: (e) => e.entry[0],
    //         mapGroup: true,
    //         mapLevel: 1
    //     }},
    //     {name: 'group', args: {
    //         groupDesc: '小类',
    //         keyFunc: (e) => e.entry[1],
    //         mapGroup: true,
    //         mapLevel: 2
    //     }},
    //     {name: 'map', args:{
    //         mapFunc: ({entry, ...rest}) => {
    //             return {entry: entry.slice(-1)[0], ...rest}
    //         },
    //         mapGroup: true,
    //         mapLevel: 3
    //     }},
    //     {name: 'ungroup', args:{
    //         type: 'insertRow',
    //         col: 'entry',
    //         sumFunc: (key, recs) => {
    //             let mb = recs.map(e => e.mb).reduce((acc, e) => acc+e, 0);
    //             let mc = recs.map(e => e.mc).reduce((acc, e) => acc+e, 0);
    //             let md = recs.map(e => e.md).reduce((acc, e) => acc+e, 0);
    //             let me = recs.map(e => e.me).reduce((acc, e) => acc+e, 0);
    //             return emptyRecord(recs[0], {entry: `${key}合计`, mb, mc, md, me})
    //         },
    //         mapGroup: true,
    //         mapLevel: 1
    //     }},
    //     {name: 'ungroup', args:{
    //         type: 'juxtaposed',
    //         col: 'entry',
    //         sumFunc: (key, recs) => {
    //             let mb = recs.map(e => e.mb).reduce((acc, e) => acc+ (e===""? 0:e) , 0);
    //             let mc = recs.map(e => e.mc).reduce((acc, e) => acc+ (e===""? 0:e) , 0);
    //             let md = recs.map(e => e.md).reduce((acc, e) => acc+ (e===""? 0:e) , 0);
    //             let me = recs.map(e => e.me).reduce((acc, e) => acc+ (e===""? 0:e) , 0);
    //             return emptyRecord(recs[0], {entry: `${key}合计`, mb, mc, md, me})
    //         },
    //         mapGroup: true,
    //         mapLevel: 0
    //     }},
    //     {name: 'dummy', args: {sheetSpec: true}},
    //     // {name: 'cascade', args: {
    //     //     referred: 'balance',
    //     //     layerFunc: rec=>rec.ccode.length,
    //     //     gatherFunc: isParent,
    //     //     mapGroup: true,
    //     //     mapLevel: 0
    //     // }},
    // ],
    desc: "资产负债表",
    type: 'COMP',
    data: [],
    referred: {
        balance: { tableName: 'DATA', sheetName: 'PeriodicalBalance' },
        category: { tableName: 'CONF', sheetName: 'CodeGrouped'}
    }
}
