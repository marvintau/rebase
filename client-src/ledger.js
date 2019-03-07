import Table from './table.js';

/**
 * Table can be initiated from three types of source. Either an object that
 * holds several columns in array from, or an array that holds several rows
 * in object form. For the two types of data, the object must be flat (a.k.a
 * not nested), or an array of array without any header, just a plain table.
 * 
 * For grouped column or rows, the grouping method must be specified along
 * the data.
 * 
 * Finally, render the table with contentEditable cell, and all the changes
 * must be saved to the data held by Table object.
 */

Array.prototype.last = function(){
    return this[this.length - 1];
}

    /**
     * Flatten a nested object structure into single-layer, by preserving the 
     * path by concatenating the keys with delimiter.
     * 
     * @example {a: {b: 1, c: 2, f: {d:4, g: 5}}} -> {a-a-}
     * 
     * @param {Object} obj the data object
     * @param {string} prefix prefix
     * @param {string} delim delimiter
     */

 function flat (data, prefix, delim){

    delim = delim ? delim : "-";
    
    let result = {};
    for (let key in data) {
        let p = (prefix ? prefix + delim : "") + key;
        if (data[key] && data[key].constructor === Object)
            Object.assign(result, flat(data[key], p, delim));
        else
            Object.assign(result, {[p] : data[key]})
    }

    return result;
}

function layer(data, spec) {

    spec = spec ? spec : {};

    let delim = spec.delim ? spec.delim : "-",
        flatObj = flat(data, "", delim),
        span  = spec.span ? spec.span : false;

    let keys    = Object.keys(flatObj),
        layers  = [],
        allDone = array => array.every(e => e.lastIndexOf(delim) < 0);
    
    // split the string into two parts at the last delimiter
    let splitAtLastDelim = (str, delim, pos) =>
        (pos = str.indexOf(delim)) == -1 ? 
        {most: str, rest: str} :
        {most: str.slice(0, pos), rest:str.slice(pos+1)};

    for(;!allDone(keys);){
        let splits = keys.map(e => splitAtLastDelim(e, delim));
        layers.push(splits.map(e=>e.most));
        keys = splits.map(e => e.rest);
    }
    layers.push(keys);
    layers = layers.map(layer => layer.map(cell => ({title:cell, colspan:1, rowspan:1})));


    return layers;
}

function fillTable(head, body, spec){

    let hideColumns = {};

    console.log(spec);

    if (spec.reduce){
        if (body.length > 1)
        for (let i = 0; i < body[0].length; i++){
            if (body.map(e => e[i]).every((v, _, a) => (v.content == a[0].content))) {
                hideColumns[i] = true;
            }
            if (head[0][i].hide){
                hideColumns[i] = true;
            }
        }
    }

    if (spec.hideBoolean){
        for (let i = 0; i < body[0].length; i++)
        if(head[0][i].type == "bit") {
            hideColumns[i] = true;
        }
    }

    let table   = document.createElement('table'),
        thead   = document.createElement('thead'),
        tbody   = document.createElement('tbody');
    
    table.appendChild(thead);
    table.appendChild(tbody);

    let tr, th, td;
    
    console.log(body[0], 'fill');

    for (let i = 0; i < head.length; i++){
        tr = document.createElement('tr');
        for (let j = 0; j < head[i].length; j++){
            if(!hideColumns[j]){
                th = document.createElement('th');
                th.innerText = head[i][j].def;
                th.setAttribute('id', head[i][j].title);
                th.setAttribute('rowspan', head[i][j].rowspan);
                th.setAttribute('colspan', head[i][j].colspan);
                if (spec && spec.narrow)
                    th.style = "white-space: normal; word-wrap: normal";
                tr.appendChild(th);
            }
        }
        thead.appendChild(tr);
    }        

    for (let i = 0; i < body.length; i++){
        tr = document.createElement('tr');
        tr.setAttribute('row', i);
        for (let j = 0; j < body[i].length; j++){
            if (!hideColumns[j]){
                td = document.createElement('td');
                td.innerText = body[i][j].content;
                td.setAttribute('data-type', body[i][j].type);
                td.setAttribute('class', body[i][j].type);
                td.setAttribute('col', j);
                tr.appendChild(td);
            }
        }
        tbody.appendChild(tr);
    }

    return table;
}
export default class Ledger extends Table{

    /**
     * Table constructor accepts array of object, where the object
     * should contain only primitive data structure, like string or
     * interger. The object is nestable, but for nested object, all
     * its children should be object as well. Consider the record as
     * a full-tree.
     * 
     * @param {Array of Object} data an array of object
     */
    constructor(data, spec, name){
 
        spec = spec ? spec : {};

        // 2. Array of object: In this case, like most of the database,
        //    the object represents the record, while the array the row.
        //    The header are derived from the object keys.

        let head = [[]],
            body = [[]];

        if (data.every(e=> typeof e === "object")) {
            if(data.length > 0){
                head = layer(data[0], spec),
                body = data.map(e => Object.values(flat(e)));
                super(head, body, name);
            }
        }
        // 3. Object of arrays.
        else if(data.constructor === Object) {
                head = layer(data, spec),
                body = transpose(data);
                super(head, body, name);
        } else {
            throw new TypeError('Ledger: unrecognized data. It must be Array of objects, or Object of arrays');
        }

        console.log(this);
    }

    normalize(){
        for (let i = 0; i < this.body.length; i++)
        for (let j = 0; j < this.body[i].length; j++)
            // console.log(this.body[i][j].type);
            switch(this.body[i][j].type) {
                case "int":
                case "tinyint":
                case "smallint":
                case "float":
                case "money":
                if(this.body[i][j].content == null || this.body[i][j].content == "")
                    {this.body[i][j].content = 0;}
                    break;
                case "nvarchar":
                case "varchar":
                if(this.body[i][j].content == null)
                    {this.body[i][j].content = "";}
                    break;
                case "bit":
                if(this.body[i][j].content == null)
                    {this.body[i][j].content = false;}
                    break;
            }
    }

    assignDataColumn(ithColumn, object){
        for (let i = 0; i < this.body.length; i++){
            Object.assign(this.body[i][ithColumn], object);
        }
    }

    setColumn(columnTypeDict){
        
        for (let i = 0; i < this.head.length; i++)
        for (let j = 0; j < this.head[i].length; j++){
            let title = this.head[i][j].title,
                entry = columnTypeDict[title];
            Object.assign(this.head[i][j], entry ? entry : {def: title, hide: true});
        }

        let lastHead = this.head.last();
        for (let i = 0; i < this.body.last().length; i++){
            this.assignDataColumn(i, {type: lastHead[i].type});
        }

        this.normalize();
    }

    removeBodyColumn(start, length){
        if (length === undefined) length = 1;
        let bodyCol = this.body.map(e => e.splice(start, length)).flat();
        let headCol = this.head.map(e => e.splice(start, length)).flat();
        return {[headCol.map(e=>e.title).join('-')] : bodyCol[0]}
    }

    getBodyColumn(col, start, end){
        return this.body.map(e => e[col]).slice(start, end);
    }

    render(parentID, spec){

        spec = spec ? spec : {};
        
        let start = spec.start ? spec.start: 0,
            len   = spec.len ? spec.len : 35,
            end   = spec.end ? end : len;
        
        // console.log(this.getBodyColumn(0, start, end));



        let outer   = document.createElement('div');
        outer.setAttribute('class', 'ledger');
        outer.appendChild(fillTable(this.head, this.body.slice(start, end), spec));
        // outer.appendChild(fillTable([Object.keys(this.summary).map(e=>({title:e, rowspan:1, colspan:1}))], [Object.values(this.summary)], {narrow: true}));

        document.getElementById(parentID).appendChild(outer);

        if (spec.editable){
            $('td').on('dblclick', (e) => {
                let type = $(e.target).attr("data-type");

                switch(type){
                    case "int":
                    case "float":
                    case "smallint":
                    case "tinyint":
                    case "varchar":
                    case "money":
                        let text = e.target.innerText;
                        $(e.target).empty();
                        $(e.target).append(`<input value='${text}'></input>`);
                        e.target.firstChild.focus();
                        break;
                }
            })

            $('td').focusout((e) => {
                let elem = e.target.parentElement;
                let content = elem.firstChild.value;

                let col = $(elem).attr('col'), 
                    row = $(elem.parentElement).attr('row');
                
                let cell = this.body[row][col];
                if (cell.type.includes('int') || cell.type == 'money'){
                    if (!isNaN(content)){
                        this.body[row][col].content = parseFloat(content);
                        elem.innerText = content;
                    }else
                        elem.innerHTML = `<span style="color:red;">${content}</span>`;
                } else {
                    elem.innerText = content;
                    this.body[row][col].content = content;
                }
            })
        }
    }
}
