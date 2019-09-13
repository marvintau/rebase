const fs = require('fs').promises;

fs.readFile('./cashflowWorksheet-direct.csv', 'utf-8')
.then((res) => {
    let lines = res.split('\r\n');
    let currLine = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum ++){
        lines[lineNum] = lines[lineNum].split(',');

        for (let col in lines[lineNum]){
            if (lines[lineNum][col] === '' && currLine[col] !== undefined && (col==0 || col==1)){
                lines[lineNum][col] = currLine[col];
            }
        }
        
        currLine = lines[lineNum];
    }

    for (let line of lines){
        let last = line.pop();
        if(last.length > 2){
            last = [last.slice(0, -2), last.slice(-2)];
        } else {
            last = [last, '待定']
        }
        line.push(...last); 
    }

    for (let line of lines){
        let first = line.shift();
        line[0] = `${first}-${line[0]}`;
    }

    for (let lineNum = 0; lineNum < lines.length; lineNum++){
        let [path, method, category, side] = lines[lineNum];
        category = category.split('/');
        lines[lineNum] = {path, method, category, side};
    }

    let cashflowPathDict = {};
    for (let line of lines){
        let [section, item] = line.path.split('-');
        
        if (cashflowPathDict[section]){
            cashflowPathDict[section][item] = {};
        } else {
            cashflowPathDict[section] = {}
        }
    }

    console.log(cashflowPathDict);

    let text = lines.map(line => JSON.stringify(line)).join('\n');

    return fs.writeFile('./cashflowOutput.csv', text, 'utf-8')
}).then((res) => {
    console.log('write file done');
}).catch((err) => {
    console.log('err', err);
})