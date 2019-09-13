import { equal } from "assert";

let voucherHead = [
    {colKey: 'ino_id', name:'凭证编号', attr:{type: 'String'}},
    {colKey: 'ccode', name: '科目编码', attr:{display:'none'}},
    {colKey: 'ccode_name', name: '科目名称', attr:{type: 'Code'}},
    {colKey: 'dbill_date', name: '开票日期'},
    {colKey: 'cCusName', name: '客户名称'},
    {colKey: 'ccode_equal', name: '对方科目', attr:{type:'MultiCode'}},
    {colKey: 'cdigest', name: '摘要'},

    {colKey: 'md', name: '借方发生', attr:{sortable: true, type: 'Number'}},
    {colKey: 'mc', name: '贷方发生', attr:{sortable: true, type: 'Number'}},
]

let analyzeHead = [
    {colKey: 'ccode', name: "科目", attr:{display:'none'}},
    {colKey: 'ccode_name', name: "科目名称"},
    
    {colKey: 'mb', name: '期初余额', attr:{sortable: true, type: 'Number'}},
    {colKey: 'me', name: '期末余额', attr:{sortable: true, type: 'Number'}},
    {colKey: 'ino_id', name: "所在凭证", attr: {sortable: true, type: 'String'}},
    {colKey: 'md', name: '借方发生', attr:{sortable: true, type: 'Number'}},
    {colKey: 'mc', name: '贷方发生', attr:{sortable: true, type: 'Number'}},
]

export default{
    referred: {
        BALANCE: {desc: '科目余额', location: 'remote'},
        ENTRIES: {desc: '明细分录', location: 'remote'}
    },
    head: analyzeHead,
    proc({BALANCE, ENTRIES}, logger){

        let balanceData = BALANCE.sheet.data; 

        console.time('cascadeDict')
        let cascaded = balanceData
            .tros(category => `${category.get('iperiod')}-${category.get('iyear')}`)
            .reverse()
            .grip(category => `${category.get('iperiod')}-${category.get('iyear')}`, logger, '期间-年')
            .iter((key, recs) => {
                return recs
                .tros(rec => rec.get('ccode'))
                .uniq(rec => rec.get('ccode'))
                .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
                    let descCode  = desc.get('ccode'),
                        ancesCode = ances.get('ccode');
                    return descCode.slice(0, ancesCode.length).includes(ancesCode)
                });
            })
        console.timeEnd('cascadeDict');

        let pathDict = cascaded.iter((key, recs)=>{
            let indice = recs.flatten().map(e => [e.get('ccode'), e.path]);
            return Object.fromEntries(indice);
        })

        let entriesData = ENTRIES.sheet.data;

        entriesData.grip(entry => `${entry.get('iperiod')}-${entry.get('iyear')}`)
            .iter((key, recs) => {
                let dictPeriodical = pathDict.get(key),
                    cascadedPeriod = cascaded.get(key);

                // 通常是用于结转的期间，目前如果在凭证中出现了未在总账中出现的期间则不显示
                // 但未来恐怕还是要对此单独作处理。
                if(dictPeriodical === undefined){
                    return;
                }

                let routes = recs.grip(route => route.get('ino_id'))
                    .iter((key, recs) => {
                        return recs
                            .grip(line => line.get('ccode'))
                            .iter((key, recs) => {
                                return recs.sum(voucherHead)
                                    // .pick(['ccode', 'ccode_name', 'mc', 'md', 'ino_id'])
                                    .tab(recs, voucherHead);
                            }).grap()
                    })
                    .grap().flat()
                    .grip(route => route.get('ccode'), logger, '借-贷')
                    .iter((key, recs) => {
                        let sum = recs.sum(analyzeHead);
                        for (let rec of recs){
                            sum.sub(rec);
                        }
                        return sum;
                    })
                    .grap()
                

                for (let i = 0; i < recs.length; i++){
                    let entry = recs[i],
                        {ccode, ccode_name, ccode_equal} = entry.cols,
                        entryPath = dictPeriodical[ccode],
                        equalCodes = String(ccode_equal).split(',');

                    if(entryPath !== undefined){
                        let entryFullName = cascadedPeriod.pathApply(entryPath, (ref) => {
                            return ref.cols.ccode_name;
                        }).join('-');
                        entry.set('ccode_name', {
                            name: ccode_name,
                            code: ccode,
                            path: entryFullName
                        })
                    }

                    let equals = equalCodes.map(equalCode => {

                        let equalPath = dictPeriodical[equalCode];

                        if (equalPath !== undefined){
                            let equalFullName = cascadedPeriod.pathApply(equalPath, (ref) => {
                                return ref.cols.ccode_name;
                            });
                            return {
                                name: equalFullName[equalFullName.length - 1],
                                code: equalCode,
                                path: equalFullName.join('-') 
                            }
                        } else {
                            return equalCode;
                        }
                    })

                    entry.set('ccode_equal', equals);
                }

                for (let i = 0; i < routes.length; i++){
                    let route = routes[i];
                    let path = dictPeriodical[route.get('ccode')];
                    let mc = route.get('mc');
                    let md = route.get('md');

                    // 如果总账路径为undefined，意即这笔分录的科目没有体现在总账里。
                    // 目前我们会先将它单列出来追加在级联目录的末尾。更理想的方法是
                    // 在总账中创建它的条目，或者找到它的ancestor。
                    if (path === undefined){
                        cascadedPeriod.push(route);
                        continue;
                    }

                    cascadedPeriod.pathApply(path, (ref, isLast) => {
                        if(isLast){
                            ref.sub(route);
                        }
                    })
                }

            })

        return {data: cascaded};
    },
    desc: '发生额变动分析',
    type: 'DATA',
}