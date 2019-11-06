import XLSX from 'xlsx';
import path from 'path';
const fs = require('fs').promises;

import colRemap from './parseTypeDictionary';

const BACKUP_PATH='../ServerStorage';

function parseRemap(type, book, year){

    let recRemap = colRemap[type];

    let sheet = book.Sheets[book.SheetNames[0]],
        // 尽管名字叫做sheet_to_json，但其实它指的是Plain Object
        parsed = XLSX.utils.sheet_to_json(sheet);

    // console.log(parsed);
    for (let p = 0; p < parsed.length; p++){
        let rec = parsed[p],
            newRec = {};
        for (let ent = 0; ent < recRemap.length; ent++){
            let [oldKey, newKey] = recRemap[ent];
            newRec[newKey] = rec[oldKey];
        }

        if (newRec.iyear === undefined){
            newRec.iyear = year;
        }

        parsed[p] = newRec;
    }

    return parsed
}

export default function bookRestore(projName, postProcess=(x) => x){

    return fs.readdir(path.resolve(BACKUP_PATH, projName))
    .then(res => {
        let fileNames = res.filter(path => path.includes(projName) && path.includes('SOURCE'));
        
        console.log('ready to handle', fileNames);
                
        // let balancesPath = fileNames.filter(e => e.includes('BALANCE')),
        //     journalsPath = fileNames.filter(e => e.includes('JOURNAL')),
        //     assistedsPath = fileNames.filter(e => e.includes('ASSISTED')),
        //     cashflowWorksheetPath = fileNames.filter(e => e.includes('CASHFLOW_WORKSHEET'));

        // if((balancesPath.length !== journalsPath.length) || (journalsPath.length !== assistedsPath.length)){
        //     console.log('RESTORE_MSG', '缺少某些期间/年份的数据表，对应期间的查询也无法生成，不过没有大碍。')
        // }

        let data = {
            BALANCE: [],
            JOURNAL: [],
            ASSISTED: [],
            CASHFLOW_WORKSHEET: [],
        };

        return Promise.all(fileNames.map(e => {
            return fs.readFile(path.resolve(BACKUP_PATH, projName, e))
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
                    [_S, _N, type, year, _FT] = fileName.split('.');

                let parsed = parseRemap(type, book, year)

                // 因为data中汇总了所有期间的数据，因此需要flatten，或者按记录push进来。
                if(type === 'CASHFLOW_WORKSHEET'){
                    data[type] = parsed;
                } else {
                    data[type].push(...parsed);
                }
            }

            data = postProcess(data);
            console.log(Object.values(data).map(e => e.length), 'restoring');
            return Promise.all(Object.keys(data).map(type => {
                if(data[type].length === 0){
                    return true;
                } else {
                    return fs.writeFile(path.resolve(BACKUP_PATH, projName, `RESTORED.${projName}.${type}.JSON`), JSON.stringify(data[type]));
                }
            }))                    
        })
    })
}