import Sheet from "../Booking/Sheet";
import List from "../Booking/List";
import Record from "../Booking/Record";

const SheetCategory = new List(
    {entry: '00', entry_name: '资产' },
    {entry: '0000', entry_name: '流动资产'},
    {entry: '000000', entry_name: '货币资金' },
    {entry: '000001', entry_name: '交易性金融资产' },
    {entry: '000002', entry_name: '衍生金融资产' },
    {entry: '000003', entry_name: '应收票据' },
    {entry: '000004', entry_name: '应收账款' },
    {entry: '000005', entry_name: '应收款项融资' },
    {entry: '000006', entry_name: '预付款项' },
    {entry: '000007', entry_name: '其他应收款' },
    {entry: '000008', entry_name: '存货' },
    {entry: '000009', entry_name: '合同资产' },
    {entry: '000010', entry_name: '持有待售资产' },
    {entry: '000011', entry_name: '一年内到期的非流动资产' },
    {entry: '000012', entry_name: '其它流动资产' },
    {entry: '0001', entry_name: '非流动资产'},
    {entry: '000100', entry_name: '债权投资'},
    {entry: '000101', entry_name: '其他债权投资'},
    {entry: '000102', entry_name: '长期应收款'},
    {entry: '000103', entry_name: '长期股权投资'},
    {entry: '000104', entry_name: '其他权益工具投资'},
    {entry: '000105', entry_name: '其他非流动金融资产'},
    {entry: '000106', entry_name: '投资性房地产'},
    {entry: '000107', entry_name: '固定资产'},
    {entry: '000108', entry_name: '在建工程'},
    {entry: '000109', entry_name: '生产性生物资产'},
    {entry: '000110', entry_name: '油气资产'},
    {entry: '000111', entry_name: '使用权资产'},
    {entry: '000112', entry_name: '无形资产'},
    {entry: '000113', entry_name: '开发支出'},
    {entry: '000114', entry_name: '商誉'},
    {entry: '000115', entry_name: '长期待摊费用'},
    {entry: '000116', entry_name: '递延所得税资产'},
    {entry: '000117', entry_name: '其他非流动资产'},
    {entry: '01', entry_name: '负债' },
    {entry: '0100', entry_name: '流动负债' },
    {entry: '010000', entry_name: '短期借款' },
    {entry: '010001', entry_name: '交易性金融负债' },
    {entry: '010002', entry_name: '衍生金融负债' },
    {entry: '010003', entry_name: '应付票据' },
    {entry: '010004', entry_name: '应付账款' },
    {entry: '010005', entry_name: '预收款项' },
    {entry: '010006', entry_name: '合同负债' },
    {entry: '010007', entry_name: '应付职工薪酬' },
    {entry: '010008', entry_name: '应交税费' },
    {entry: '010009', entry_name: '其他应付款' },
    {entry: '010010', entry_name: '持有待售负债' },
    {entry: '010011', entry_name: '一年内到期的非流动负债' },
    {entry: '010012', entry_name: '其他流动负债' },
    {entry: '0101', entry_name: '非流动负债'},
    {entry: '010100', entry_name: '长期借款' },
    {entry: '010101', entry_name: '应付债券之优先股' },
    {entry: '010102', entry_name: '应付债券之永续债' },
    {entry: '010103', entry_name: '租赁负债' },
    {entry: '010104', entry_name: '长期应付款' },
    {entry: '010105', entry_name: '预计负债' },
    {entry: '010106', entry_name: '递延收益' },
    {entry: '010107', entry_name: '递延所得税负债' },
    {entry: '010108', entry_name: '其他非流动负债' },
    {entry: '010109', entry_name: '所有者权益' },
    {entry: '010110', entry_name: '实收资本（或股本）'},
    {entry: '010111', entry_name: '其他权益工具之优先股'},
    {entry: '010112', entry_name: '其他权益工具之永续债'},
    {entry: '010113', entry_name: '资本公积'},
    {entry: '010114', entry_name: '减：库存股' },
    {entry: '010115', entry_name: '专项储备' },
    {entry: '010116', entry_name: '盈余公积'},
    {entry: '010117', entry_name: '未分配利润' },
);


export default {
    referred: {
        savedFinancialStatementConf: {desc:'已保存的资产负债表配置表', location: 'remote', type: 'CONF'},
        CATEGORY: {desc: '科目类别', location:'remote'}
    },
    proc({CATEGORY, savedFinancialStatementConf: saved}, logger){

        let categoryData = CATEGORY.sheet.data;
        categoryData = categoryData
        .tros((rec) => rec.get('ccode'))
        .uniq((rec) => rec.get('ccode'))
        .cascade(rec=>rec.get('ccode').length, (desc, ances) => {
            let descCode = desc.get('ccode'),
                ancesCode = ances.get('ccode');
            return descCode.slice(0, ancesCode.length).includes(ancesCode)
        }, logger, '按科目级联')
        .toCascadedObject('ccode_name');

        console.log(categoryData);

        let head = [
            {colKey: 'entry', name: '条目级次'},
            {colKey: 'entry_name', name: '条目名称'},
            {colKey: 'corrCategory', name:'对应科目',attr:{type: 'cascadedSelect', spec: {optionTree: categoryData}}},
            // {colKey: 'assigned', name: '对应操作',attr:{type: 'select', spec: 'SumMethod'}}
        ]
        
        // let savedData = saved.sheet.data,
        //     categoryData = CATEGORY.sheet.data,
        //     savedDict = {};

        // for (let i = 0; i<savedData.length; i++){
        //     let key = savedData[i].get('ccode');
        //     savedDict[key] = savedData[i];
        // }
        // for (let i = 0; i < categoryData.length; i++){
        //     let rec = categoryData[i],
        //         key = rec.get('ccode'),
        //         keyName = rec.get('ccode_name');

        //     let corrClass = savedDict[key] ? savedDict[key].get('corrClass') : corrClassValue(keyName),
        //         method = savedDict[key] ? savedDict[key].get('assigned') : 'add';

        //     categoryData[i].set('corrClass', corrClass);
        //     categoryData[i].set('assigned', method);
        // }
        
        let data = SheetCategory
            .map(e => new Record(e))
            .cascade(rec=>rec.get('entry').length, (desc, ances) => {
                let descCode = desc.get('entry'),
                    ancesCode = ances.get('entry');
                return descCode.slice(0, ancesCode.length).includes(ancesCode)
            }, logger, '按科目级联');

        return {head, data};
    },
    saveProc(originalData){
        return originalData.flatten().map(e => e.toObject());
    },
    desc: '资产负债表配置表',
    type: 'CONF'
}