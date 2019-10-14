const fs = require('fs').promises;

const {fileName} = Object.fromEntries(process.argv.slice(2).map(param => param.split('=')));
console.log(fileName);

function toPathArray(string){
    return [0, ...string.split('-')]
}

function toPathObject(obj){
    let newObj = {};
    for (let key in obj){
        newObj[key] = toPathArray(obj[key]);
    }
    return newObj;
}

function padCategoryName(lines){
    let res = [],
        currCategory = {};

    for (let line of lines) {
        let columns = line.split('\t');

        for (let i = 0; i < columns.length - 3; i++){
            if (columns[i].length !== 0){
                currCategory[i] = columns[i];
            }
            columns[i] = currCategory[i];
        }
    
        res.push(columns);
    }

    return res;
}

function fromLinesToDict(lines){

    let categoryDictionary = {};
    for (let line of lines){

        // get method, category, and side
        let [method, category, side] = line.slice(-3)

        let ref = categoryDictionary;
        // console.log(line.length - 3);
        for (var i = 0; i < line.length - 4; i++){
            if(ref[line[i]] === undefined) ref[line[i]] = {};
            ref = ref[line[i]];
        }
        if (ref[line[i]] === undefined){
            ref[line[i]] = [];
        }
        console.log(line.length, line, 'from');
        ref[line[i]].push(toPathObject({method, category, side}));
    }

    return categoryDictionary;
}

fs.readFile(fileName, 'utf-8')
    .then((res) => {
        let lines = res.split('\n');

        let padded = padCategoryName(lines);
        console.log(padded);
        let cateDictionary = fromLinesToDict(padded);
        let output = JSON.stringify(cateDictionary, null, 4);

        return fs.writeFile(`${fileName}.json`, output, 'utf-8')

    }).then((res) => {
        console.log('write file done');
    }).catch((err) => {
        console.log('err', err);
    })