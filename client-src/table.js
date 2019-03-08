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
function genTR(data, dom, spec){

    spec = spec ? spec : {};
    spec.name = spec.name ? spec.name : "table";
    spec.colAttrs = spec.colAttrs ? spec.colAttrs : Array(data[0].length).fill(0).map(e=>({}));

    let tr, cell, cellDom;
    try {
        for (let i = 0; i < data.length; i++){
            tr = document.createElement('tr');
            for (let j = 0; j < data[i].length; j++){

                cell = data[i][j];

                if(!spec.colAttrs[j].hide){
                    
                    cellDom = document.createElement(spec.ishead ? 'th' : 'td');
                    cellDom.setAttribute('id', `${spec.name}-${spec.ishead?"head":"body"}-${i}-${j}`);

                    let typeClass = spec.ishead ? "" : spec.colAttrs[j].type,
                        styleClass = spec.colAttrs[j].style ? spec.colAttrs[j].style : "";

                    cellDom.setAttribute('class', `${spec.name} ${typeClass} ${styleClass}`);
                    cellDom.innerText = spec.ishead? cell.attr.def : cell.data;

                    // for (let k in spec.rowAttrs[i]) {cellDom.setAttribute(k, spec.rowAttrs[i][k])};
                    for (let k in spec.colAttrs[j]) {cellDom.setAttribute(k, spec.colAttrs[j][k])};
                    for (let k in cell.attrs){ cellDOM.setAttribute(k, cell.attrs[k]); }
                    
                    cellDom.setAttribute('row', i);
                    cellDom.setAttribute('col', j);

                    tr.appendChild(cellDom);
                }
            }
            dom.appendChild(tr);
        }
    } catch (e) {
        console.error(e,"genTR", data);
    }
}


export default class Table {
    
    constructor (head, body, name, parentDom){
        this.head = new Grid(head);
        this.body = new Grid(body);
        this.name = name ? name : "";

        this.head.attrAll({rowspan: 1, colspan: 1});

        let tableWrapper = document.createElement('div');
        tableWrapper.setAttribute('id', `table-wrapper-${this.name}`);

        let table = document.createElement('div');
        table.setAttribute('id', `table-${this.name}`);
        table.setAttribute('class', "table");
        tableWrapper.appendChild(table);

        let pagin = document.createElement('div');
        pagin.setAttribute('id', `table-${this.name}-pagin`);
        tableWrapper.appendChild(pagin);

        parentDom.appendChild(tableWrapper);
    }

    pagination(){

        $(`#table-${this.name}-pagin`).pagination({
            dataSource: this.body.rows,
            pageSize: 15,
            showGoInput: true,
            showGoButton: true,
            showPageNumbers: false,
            showNavigator: true,

            callback: (data, pagination) => {
                let table = this.renderTableDOM(data);
                $(`#table-${this.name}`).empty();
                $(`#table-${this.name}`).append(table);
                this.bindEvents();
            }
        })
    }

    renderTableDOM(data, spec){

        let table   = document.createElement('table'),
            thead   = document.createElement('thead'),
            tbody   = document.createElement('tbody');
        
        table.appendChild(thead);
        table.appendChild(tbody);
        


        genTR(this.head.rows, thead, {
            ishead : true,
            colAttrs : this.head.colAttrs
        });
        genTR(data, tbody, {
            ishead : false,
            colAttrs : this.body.colAttrs
        });

        return table;
    }

    bindEvents() {

        $('td').dblclick((e) => {
            let type = $(e.target).attr("type");
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
    
            let col = parseInt($(elem).attr('col')), 
                row = parseInt($(elem).attr('row'));
            
            console.log(this.body.rows[row]);
            let cell = this.body.rows[row][col];
            if (cell.type.includes('int') || cell.type == 'money'){
                if (!isNaN(content)){
                    this.body[row][col].content = parseFloat(content);
                    elem.innerText = content;
                }else
                    elem.innerHTML = `<span style="color:red;">${content}</span>`;
            } else {
                elem.innerText = content;
                this.body.set(row, col, content);
            }
        })
    
    }
    
}