import Grid from "./grid.js";

/**
 * genTR: generate TRs from grid, and append to dom object.
 * 
 * If the cell doesn't have an attribute of hiding, create
 * cell DOM object. the cell object could be either TD or TH.
 * 
 * @param {Grid} grid the grid object
 * @param {HTMLDomElement} dom DOM element
 * @returns nothing
 */
function genTR(grid, dom, ishead, onDblCkick, onLeave){

    let tr, cell, cellDom;

    for (let i = 0; i < grid.size.rows; i++){
        tr = document.createElement('tr');
        for (let j = 0; j < grid.size.cols; j++){

            cell = grid.rows[i][j];
            if(!cell.attrs.hide){
                cellDom = document.createElement(ishead ? 'th' : 'td');
                cellDom.setAttribute('id', `${this.name}-head-${i}-${j}`);
                cellDom.setAttribute('class', `${this.name} ${cell.attrs.style}`);
                cellDom.innerText = cell.data;

                for (let k in grid.rowAttrs[i]) {th.setAttribute(k, cell.attrs[k])};
                for (let k in grid.colAttrs[i]) {th.setAttribute(k, cell.attrs[k])};
                for (let k in cell.attrs){ th.setAttribute(k, cell.attrs[k]); }
                
                tr.appendChild(cellDom);
            }
        }
        dom.appendChild(tr);
    }

}


export default class Table {
    
    constructor (head, body, name){
        this.head = head;
        this.body = body;
        this.name = name ? name : "";
    }

    setDatatypeFromDict(){

        for (let i = 0; i < this.head.size.rows; i++)
        for (let j = 0; j < this.head.size.cols; j++){
            let title = this.head[i][j].title,
                entry = columnTypeDict[title];
            Object.assign(this.head[i][j], entry ? entry : {def: title, hide: true});
        }
    }

    toDOM(parentDom, spec){

        spec = spec ? spec : {};

        let start = spec.start ? spec.start : 0,
            end   = spec.end   ? spec.end   : 30;

        let table   = document.createElement('table'),
            thead   = document.createElement('thead'),
            tbody   = document.createElement('tbody');
        
        table.appendChild(thead);
        table.appendChild(tbody);
        parentDom.appendChild(table);

        genTR(this.head, thead, true);
        genTR(this.body.sliceRow(start, end), tbody, false);

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

    mergeHead(){

        // if(j > 0 && this.head[i][j-1].data === this.head[i][j].data) {
        //     this.head[i][j-1].colspan += 1;
        //     this.head[i][j].markedDelete = true;
        // }
        // if(i > 0 && this.head[i-1][j].data === this.head[i][j].data) {
        //     this.head[i-1][j].rowspan += 1;
        //     this.head[i][j].markedDelete = true;
        // }
    }
}