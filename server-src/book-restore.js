import XLSX from 'xlsx';
import path from 'path';
const fs = require('fs').promises;
import del from 'del';

import colRemap from './parseTypeDictionary';

const BACKUP_PATH='../ServerStorage';

function parseRemap(type, book){

    let recRemap = colRemap[type];

    let sheet = book.Sheets[book.SheetNames[0]],
        // 尽管名字叫做sheet_to_json，但其实它指的是Plain Object
        parsed = XLSX.utils.sheet_to_json(sheet);

    console.log(parsed);
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
            FINANCIAL_WORKSHEET: []
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

                let parsed = parseRemap(bookType, book)
                // 因为data中汇总了所有期间的数据，因此需要flatten，或者按记录push进来。
                if(['CASHFLOW_WORKSHEET', 'FINANCIAL_WORKSHEET'].includes(bookType)){
                    data[bookType] = parsed;
                } else {
                    data[bookType].push(...parsed);
                }
            }

            data = postProcess(data);
            console.log(Object.values(data).map(e => e.length), 'restoring');
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