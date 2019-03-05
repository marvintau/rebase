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

function getPos(el) {
    var pos = 0;
   
    for (;el;el = el.offsetParent) {
        let top = el.tagName == "BODY" ? document.documentElement.scrollTop : el.scrollTop;
        pos += (el.offsetTop - top + el.clientTop);   
    }

    return pos;
  }

export default class Ledger{
    
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

    static flat (data, prefix, delim){

        delim = delim ? delim : "-";
        
        let result = {};
        for (let key in data) {
            let p = (prefix ? prefix + delim : "") + key;
            if (data[key].constructor === Object)
                Object.assign(result, Ledger.flat(data[key], p, delim));
            else
                Object.assign(result, {[p] : data[key]})
        }
    
        return result;
    }

    static transpose(data){

        let flatData = Object.values(Ledger.flat(data));

        for (var i = 0; i < flatData.length; i++) {
            for (var j = 0; j < i; j++) {
                [flatData[i][j], flatData[j][i]] = [flatData[j][i], flatData[i][j]];
            }
        }
        return flatData;
    }

    static layer(data, spec) {

        spec = spec ? spec : {};

        let delim = spec.delim ? spec.delim : "-",
            flatObj = Ledger.flat(data, "", delim),
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
    
        if (span){

            if(j > 0 && layers[i][j-1].title === layers[i][j].title) {
                layers[i][j-1].colspan += 1;
                layers[i][j].markedDelete = true;
            }
            if(i > 0 && layers[i-1][j].title === layers[i][j].title) {
                layers[i-1][j].rowspan += 1;
                layers[i][j].markedDelete = true;
            }
        }

        return layers;
    }

    static checkDimension (obj){
        if(obj.constructor == Object) {
            if (Object.values(obj).some(e => !Array.isArray(e)))
                throw TypeError('If the outer is Object, then the inner must be Array');
            if (Object.values(obj).map(e => e.length).some((val, _, arr) => val != arr[0]))
                throw TypeError('The inner arrays have different length');
            return 0;
        } else if (Array.isArray(obj)) {
            if (obj.some(e => e.constructor !== Object))
                throw TypeError('If the outer is Array, then the inner must be Object');
            if (obj.map(e => Object.keys(e).length).some((val, _, arr) => val != arr[0]))
                throw TypeError('the inner Objects have different length');
            return 0;
        } else {
            throw TypeError('Unrecognized data structure');
        }
    }

    /**
     * Table constructor accepts array of object, where the object
     * should contain only primitive data structure, like string or
     * interger. The object is nestable, but for nested object, all
     * its children should be object as well. Consider the record as
     * a full-tree.
     * 
     * @param {Array of Object} data an array of object
     */
    constructor(data, spec){
 
        Ledger.checkDimension(data);

        this.head = [];
        this.body = [[]];

        if( Array.isArray(data)) {

            // 1. Array of array: In this case, like most of the scientific
            //    computing software, the inner array represents the column,
            //    while the outer the row. The header is left blank and can
            //    be added later.
            
            if (data.every(e=>e.length !== undefined) &&
                data.every(e=>e.every(ee => typeof ee !== "object"))){
                    this.body = data;
                }

            // 2. Array of object: In this case, like most of the database,
            //    the object represents the record, while the array the row.
            //    The header are derived from the object keys.

            else if (data.every(e=> typeof e === "object")) {
                if(data.length > 0){
                    this.head = Ledger.layer(data[0], spec);
                    this.body = data.map(e => Object.values(Ledger.flat(e)));

                    console.log('initiated from AoO', this.head, this.body);
                }
            }

        // 3. Object of arrays.
        } else if(data.constructor === Object) {
            this.head = Ledger.layer(data, spec);
            this.body = Ledger.transpose(data);

            console.log('initiated from OoA')
        }
    }

    render(parentID, spec){

        spec = spec ? spec : {};
        
        let start = spec.start ? spec.start: 0,
            len   = spec.len ? spec.len : 30,
            end   = spec.end ? end : len;

        let outer   = document.createElement('div'),
            table   = document.createElement('table'),
            thead   = document.createElement('thead'),
            tbody   = document.createElement('tbody');
        outer.setAttribute('class', 'ledger');
        outer.appendChild(table);
        table.appendChild(thead);
        table.appendChild(tbody);

        let tr, th, td;

        
        for (let i = 0; i < this.head.length; i++){
            tr = document.createElement('tr');
            for (let j = 0; j < this.head[i].length; j++){
                th = document.createElement('th');
                th.innerText = this.head[i][j].title;
                th.setAttribute('rowspan', this.head[i][j].rowspan);
                th.setAttribute('colspan', this.head[i][j].colspan);
                tr.appendChild(th);
            }
            thead.appendChild(tr);
        }        

        for (let i = start; i < end; i++){
            tr = document.createElement('tr');
            for (let j = 0; j < this.body[i].length; j++){
                td = document.createElement('td');
                td.innerText = this.body[i][j];
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }

        document.getElementById(parentID).appendChild(outer);

        table.addEventListener('scroll', (event) => {
            console.log('ye[')
        })

        window.addEventListener('scroll', (event) => {

            // let tableClone,
            //     tablePos = getPos(table); 

            // if (tablePos < 0) {

            //     if (document.getElementById('sticky-head') === null){
                    
            //         tableClone = table.cloneNode(true);
            //         tableClone.setAttribute('id', 'sticky-head');
            //         tableClone.style.position = "sticky";
            //         tableClone.style.top = -1;
            //         tableClone.childNodes[1].style.visibility = "hidden";
            //         table.parentElement.appendChild(tableClone);
            //     }
            // } else {
            //     let tab= document.getElementById('sticky-head');
            //     if ( tab !== null){
            //         tab.remove();
            //     }
            // }

            // if (tableClone) console.log(tableClone.style.top);
        })

    }
}
