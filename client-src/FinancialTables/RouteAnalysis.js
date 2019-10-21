import {Record, List, Head} from 'persisted';

// voucherHead是凭证的表头，作为科目发生额分析的子表
let voucherHead = new Head({
    iperiod:     'String',
    ino_id:      'String',
    inid:        'String',
    ccode_name:  'String',
    ccode:       'String',
    cCusName:    'String',
    ccode_equal: 'MultiLine',
    cdigest:     'String',
    md:          'Float',
    mc:          'Float',
    iyear:       'Integer',
});

voucherHead.setColProp({colDesc: '凭证编号', isExpandToggler: true}, 'ino_id');
voucherHead.setColProp({colDesc: '行'}, 'inid');
voucherHead.setColProp({colDesc: '科目名称'}, 'ccode_name');
voucherHead.setColProp({colDesc: '科目编码', hidden: true}, 'ccode');
voucherHead.setColProp({colDesc: '客户名称', hidden: true}, 'cCusName');
voucherHead.setColProp({colDesc: '对方科目'}, 'ccode_equal');
voucherHead.setColProp({colDesc: '摘要'},     'cdigest');
voucherHead.setColProp({colDesc: '借方发生', isSortable: true}, 'md');
voucherHead.setColProp({colDesc: '贷方发生', isSortable: true}, 'mc');
voucherHead.setColProp({colDesc: '年', hidden: true}, 'iyear');
voucherHead.setColProp({colDesc: '期间'}, 'iperiod');


// analyzeHead是科目发生额分析的表头
let analyzeHead = new Head({
    iperiod:     'Integer',
    ccode_name : 'String',
    cclass:      'String',
    ccode :      'String',
    mb :         'Float',
    mc :         'Float',
    md :         'Float',
    me :         'Float',
    iyear:       'Integer',
})

analyzeHead.setColProp({colDesc: "科目名称", isExpandToggler: true}, 'ccode_name');
analyzeHead.setColProp({colDesc: "科目编码", hidden: true}, 'ccode');
analyzeHead.setColProp({colDesc: "科目类别"}, 'cclass');
analyzeHead.setColProp({colDesc: '期初余额', isSortable: true}, 'mb');
analyzeHead.setColProp({colDesc: '期末余额', isSortable: true}, 'me');
analyzeHead.setColProp({colDesc: '借方发生', isSortable: true}, 'md');
analyzeHead.setColProp({colDesc: '贷方发生', isSortable: true}, 'mc');
analyzeHead.setColProp({colDesc: '年', hidden: true}, 'iyear');
analyzeHead.setColProp({colDesc: '期间', hidden: true}, 'iperiod')


function truncName(name){
    return name.length > 4 ? `${name[0]}...` : name
}

export default{
    referred: {
        BALANCE: {desc: '科目余额', location: 'remote'},
        JOURNAL: {desc: '明细分录', location: 'remote'},
    },
    importProc({BALANCE, JOURNAL}){

        // 这部分我们将对对方科目进行一个处理，使得我们可以看到对方科目的路径。
        // 我们先通过科目层级得到科目的路径，然后再建立一个科目的叶子结点对于其
        // 路径的dict

        // 特别需要注意，当我们获取对方科目的时候会遇到两种情况，一种是客户导出
        // 给我们科目编码，通常是末级科目，然而我们需要知道末级科目所属的一级科目。
        // 然而通过鼎信诺导出的对方科目，则直接是对方科目所属一级科目的名称。以下方法
        // 能够兼容both科目编码和名称，同时兼容both末级科目和一级科目。

        // 又及，BALANCE.data并没有被转变为List of Records。因为没有必要。
        console.time('cascade');
        let cascaded = List.from(BALANCE.data)
            .ordr(rec => rec.ccode)
            .cascade(rec=>rec.ccode.length,
                (desc, ances) => {
                    let descCode  = desc.ccode,
                        ancesCode = ances.ccode;
                    return descCode.startsWith(ancesCode);
                },
                (desc, ances) => {
                    if (!ances._children){
                        ances._children = new List(0);
                    }
                    ances._children.push(desc);
                }
            )
        console.timeEnd('cascade');
        // 这一步，我们获取所有的末级科目的代码和名称，与其所在路径的对应关系

        console.time('catePath1');
        let paths = cascaded.flattenPath((e) => e._children, (e)=>e._children === undefined);
        let catePathDict = {};
        for (let i = 0; i < paths.length; i++){
            let path = paths[i];
            if (path.length === 1){
                let {ccode, ccode_name} = path[0];
                catePathDict[ccode] = ccode_name;
                catePathDict[ccode_name] = ccode_name;
            } else {
                let leaf = path[0],
                    root = path.last(),
                    joined = `${root.ccode_name}→${leaf.ccode_name}`;
                catePathDict[leaf.ccode] = joined;
                catePathDict[leaf.ccode_name] = joined;
            }
        }
        console.timeEnd('catePath1');

        // 这一步我们获取一级科目的代码和名称。
        for (let i = 0; i < cascaded.length; i++){
            let {ccode, ccode_name} = cascaded[i];
            catePathDict[ccode] = ccode_name;
            catePathDict[ccode_name] = ccode_name;
        }

        console.time('LoR');
        let voucherData = List.from(JOURNAL.data)
            .map(e => voucherHead.createRecord(e));
        console.timeEnd('LoR');

        // console.log(voucherData);

        console.time('setLine');
        for (let i = 0; i < voucherData.length; i++){
            let ccode_equal = voucherData[i].get('ccode_equal');
            if (ccode_equal !== undefined){
                ccode_equal.setLines((e)=>catePathDict[e])
            }
        }
        console.timeEnd('setLine');

        // 这部分所要实现的是：先按照"年-月-记账凭证编号"的方式为
        // vouchers分组。这样就得到了按期间-凭证编号划分的分录。
        // 但是我们所要的并不是每个凭证，而是这些凭证中都出现了哪
        // 些科目。在每个期间之内，我们形成了科目-凭证的反向索引，
        // 即通过科目来找到包含在这个期间之内所有的分录中包含这个
        // 科目的凭证。

        let periodicalVouchers = voucherData
            .grip(entry => entry.get('iyear'), 'by-year')
            .iter((key, recs) => {
                let voucherList = recs
                    .grip(route => `${route.get('iperiod')}-${route.get('ino_id')}`, 'by-voucher-id')
                    .vals();

                // voucherList现在是一个list of list，其中每个子层list是凭证。现在要将凭证中的
                // 每一行抽出来作为索引，然后将子层放在其中。同时生成一个新的列表entryList，
                // 这个列表用来保存凭证中每一行。
                let entryList = new List(0);
                for (let voucherIndex = 0; voucherIndex < voucherList.length; voucherIndex++){
                    let voucher = voucherList[voucherIndex];
                    for (let lineIndex = 0; lineIndex < voucher.length; lineIndex++){
                        let line = voucher[lineIndex];
                        line.heir = voucher;
                        entryList.push(line);
                    }
                }

                // 这部分会形成一个group，作为字典

                return entryList
                    .grip(e => e.get('ccode'))
                    .iter((key, val) => {
                        return {
                            head: voucherHead,
                            data: val,
                            tableAttr: {
                                expandable: true,
                                height: 300
                            }
                        };
                    });
            }) 

        // 接下来我们首先获得每个期间的科目发生额，然后在对应期间内
        // 从上面的科目-凭证索引中找到所有期间内对应科目的凭证列表
    
        let balanceData = List.from(BALANCE.data)
            .map(e => analyzeHead.createRecord(e))
            .ordr(category => category.get('iyear'))
            .grip(category => category.get('iyear'), {desc: '期间-年'})
            .iter((key, balance) => {
                let vouchers = periodicalVouchers.get(key);
                console.log(vouchers);
                for (let i = 0; i < balance.length; i++){
                    let ccode = balance[i].get('ccode');
                    balance[i].subs = vouchers.get(ccode);
                }

                return balance
                    .ordr(rec => rec.get('ccode'))
                    .uniq(rec => rec.get('ccode'))
                    .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
                        let descCode  = desc.get('ccode'),
                            ancesCode = ances.get('ccode');
                        return descCode.startsWith(ancesCode)
                    });
            }).grap()
            .grip(category => category.get('iyear'), {desc: '年'})

        return {head: analyzeHead, data: balanceData, tableAttr:{
            expandable: true,
            editable: true
        }};
    },
    desc: '发生额变动分析',
    type: 'DATA',
}