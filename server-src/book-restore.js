import XLSX from 'xlsx';
import path from 'path';
const fs = require('fs').promises;
import del from 'del';

import colRemap from './parseTypeDictionary';

const BACKUP_PATH='../ServerStorage';

function parseEquivArray(book){
    let sheet = book.Sheets[book.SheetNames[0]],
        parsed = XLSX.utils.sheet_to_json(sheet, {header: 1});

    parsed = parsed
        .filter(line => line.length > 1)
        .map(line => line.slice(1).map(item => item.trim()))
    
    const table = {};
    for (let line of parsed){
        for (let name of line){
            table[name] = line;
        }
    }

    return table;
}

function parseRemap(type, book){

    let recRemap = colRemap[type];

    let sheet = book.Sheets[book.SheetNames[0]],
        // 尽管名字叫做sheet_to_json，但其实它指的是Plain Object
        parsed = XLSX.utils.sheet_to_json(sheet);

    for (let p = 0; p < parsed.length; p++){
        let rec = parsed[p],
            newRec = {};
        for (let ent = 0; ent < recRemap.length; ent++){
            let [oldKey, newKey] = recRemap[ent];

            if(oldKey in rec){
                newRec[newKey] = rec[oldKey];
            }
        }

        if (newRec.iperiod === undefined){
            newRec.iperiod = 0;
        }

        parsed[p] = newRec;
    }

    // console.log('parseRemap', parsed);

    return parsed
}

export default function bookRestore(id, projName, postProcess=(x) => x){

    console.log('restoring', path.resolve(BACKUP_PATH, id, projName));

    return del([path.resolve(BACKUP_PATH, id, projName, 'RESTORED.*')], {force: true})
    .then(() => {
        return fs.readdir(path.resolve(BACKUP_PATH, id, projName))
    })
    .then(res => {
        let fileNames = res.filter(filePath => filePath.includes('SOURCE'));
        
        console.log('ready to handle', res, fileNames);
                
        let data = {
            BALANCE: [],
            JOURNAL: [],
            ASSISTED: [],
            CASHFLOW_WORKSHEET: [],
            FINANCIAL_WORKSHEET: [],
            EQUIVALENT_CATEGORY_NAMES: {}
        };

        return Promise.all(fileNames.map(e => {
            return fs.readFile(path.resolve(BACKUP_PATH, id, projName, e))
            .then(fileBuffer => {
                return XLSX.read(fileBuffer, {type: 'buffer'})
            })
            .catch(err => {
                console.error(err, 'err in reading.')
            })
        }))
        .then(result => {

            for (let i = 0; i < fileNames.length; i++){

                let fileName = fileNames[i],
                    book = result[i],
                    [_S, bookType,  _FileType] = fileName.split('.');

                if (bookType === 'EQUIVALENT_CATEGORY_NAMES'){
                    data[bookType] = parseEquivArray(book);
                    continue;
                }

                let parsed = parseRemap(bookType, book);

                // 处理科目余额的情形
                if (bookType === 'BALANCE'){
                    const {mbc, mbd, mb} = parsed[0];
                    if (mbc !== undefined && mbd !== undefined && mb === undefined){
                        for (let rec of parsed){
                            rec.mb = rec.mbc === 0 ? rec.mbd : rec.mbc;
                        }
                    }

                    const {mec, med, me} = parsed[0];
                    if (mec !== undefined && med !== undefined && me === undefined){
                        for (let rec of parsed){
                            rec.me = rec.mec === 0 ? rec.med : rec.mec;
                        }
                    }

                    parsed = parsed.filter(rec => !rec.ccode_name.trim().startsWith('*'))
                }

                if(['CASHFLOW_WORKSHEET', 'FINANCIAL_WORKSHEET'].includes(bookType)){
                    data[bookType] = parsed;
                } else {
                    data[bookType].push(...parsed);
                }
            }

            data = postProcess(data);

            return Promise.all(Object.keys(data).map(type => {
                if(data[type].length === 0){
                    return true;
                } else {
                    return fs.writeFile(path.resolve(BACKUP_PATH, id, projName, `RESTORED.${type}.JSON`), JSON.stringify(data[type]));
                }
            }))                    
        })
    })
}