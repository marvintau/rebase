import Grid from "./grid.js";

function genRec(rec, row, spec){

    let cell, cellDom, attr,
        tr = document.createElement('tr');

    if(spec.editable){
        if (!spec.ishead){
            cellDom = document.createElement("td");
            $(cellDom).append(`<button class="btn-sm btn-modify btn-outline-primary" edit-type="add"    row="${spec.prevRecords+row}">插入</button>`);
            $(cellDom).append(`<button class="btn-sm btn-modify btn-outline-danger"  edit-type="remove" row="${spec.prevRecords+row}">删除</button>`);
            $(cellDom).addClass('edit-bar');
        } else {
            cellDom = document.createElement("th");
            $(cellDom).addClass('edit-bar').text("编辑");
        }
        tr.appendChild(cellDom);
    }

    for (let j = 0; j < rec.length; j++){

        cell = rec[j];
        attr = spec.colAttrs[j];

        if((!attr.hide) && (!attr.hideNull) && (!attr.hideBoolean)){
            
            cellDom = document.createElement(spec.ishead ? 'th' : 'td');
            cellDom.setAttribute('id', `${spec.name}-${spec.ishead?"head":"body"}-${row}-${j}`);

            let typeClass = spec.ishead ? "" : spec.colAttrs[j].type,
                styleClass = spec.colAttrs[j].style ? spec.colAttrs[j].style : "";

            cellDom.setAttribute('class', `${spec.name} ${typeClass} ${styleClass} ${spec.ishead ? "th-header" : ""}`);
            cellDom.innerText = spec.ishead? cell.attr.def : cell.data;

            // for (let k in spec.rowAttrs[i]) {cellDom.setAttribute(k, spec.rowAttrs[i][k])};
            for (let k in spec.colAttrs[j]) {cellDom.setAttribute(k, spec.colAttrs[j][k])};
            for (let k in cell.attrs){ cellDOM.setAttribute(k, cell.attrs[k]); }
            
            cellDom.setAttribute('row', row);
            cellDom.setAttribute('col', j);

            tr.appendChild(cellDom);
        }
    }

    return tr;
}

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
    try {
        for (let i = 0; i < data.length; i++){
            dom.appendChild(genRec(data[i], i, spec));
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
        table.setAttribute('class', "table-outer");
        tableWrapper.appendChild(table);

        let pagin = document.createElement('div');
        pagin.setAttribute('id', `table-${this.name}-pagin`);
        tableWrapper.appendChild(pagin);

        parentDom.appendChild(tableWrapper);
    }

    pagination(spec){

        $(`#table-${this.name}-pagin`).pagination({
            dataSource: this.body.rows,
            pageSize: 50,
            showGoInput: true,
            showGoButton: true,
            showPageNumbers: false,
            showNavigator: true,

            callback: (data, pagination) => {

                let prevRecords = pagination.pageSize * (pagination.pageNumber-1);

                let table = this.renderTableDOM(data, prevRecords, spec);
                $(`#table-${this.name}`).empty();
                $(`#table-${this.name}`).append(table);
                this.bindEvents();
            }
        })
    }


    renderTableDOM(data, prevRecords, spec){

        let table   = document.createElement('table'),
            thead   = document.createElement('thead'),
            tbody   = document.createElement('tbody');
        
        table.appendChild(thead);
        table.appendChild(tbody);
        
        if (spec.hideNull){
            for (let i = 0; i < this.body.size.cols; i++){
                this.body.colAttrs[i].hideNull = data.map(row => row[i].data).every((v)=> (v==="无" || !v));
            }
        }

        if (spec.hideBoolean){
            this.body.colAttrs.forEach(e => e.hideBoolean = e.type === 'bit');
        }

        genTR(this.head.rows, thead, {
            ishead : true,
            colAttrs : this.body.colAttrs,
            editable: spec.editable
        });
        genTR(data, tbody, {
            ishead : false,
            colAttrs : this.body.colAttrs,
            editable: spec.editable,
            prevRecords: prevRecords
        });

        return table;
    }

    bindEvents() {

        $('td:not(.edit-bar)').dblclick((e) => {
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
    
        $('td:not(.edit-bar)').focusout((e) => {
            let elem = e.target.parentElement;
            let content = elem.firstChild.value;
    
            let col = parseInt($(elem).attr('col')), 
                row = parseInt($(elem).attr('row'));
            
            let cell = this.body.rows[row][col];
            console.log(cell);
            if ($(elem).attr('type').includes('int') || $(elem).attr('type') == 'money'){
                if (!isNaN(content)){
                    console.log(content);
                    this.body.rows[row][col].content = parseFloat(content);
                    elem.innerText = content;
                }else
                    elem.innerHTML = `<span style="color:red;">${content}</span>`;
            } else {
                elem.innerText = content;
                this.body.set(row, col, content);
            }
        })

        $('button[edit-type="remove"]').click(function(e){

            let row = parseInt($(e.target).attr('row'));
            $(e.target).parent().parent().get(0).remove();

            $('button[edit-type]').each((i, v) => {
                let currRow = parseInt(v.getAttribute('row'));
                if (currRow >= row) v.setAttribute('row', currRow-1);
            });
            this.body.deleteRow(row);

        }.bind(this));

        $('button[edit-type="add"]').click(function(e){

            let row = parseInt($(e.target).attr('row')),
                rowElem = $(e.target).parent().parent();
            // console.log(row);
            $('button[edit-type]').each((i, v) => {
                let currRow = parseInt(v.getAttribute('row'));
                if (currRow >= row) v.setAttribute('row', currRow+1);
            });

            let newRow = this.body.colAttrs.map(e => ({
                data: e.default ? e.default : 0,
                attr: e
            }));
            console.log(newRow);
            rowElem.after(genRec(newRow, row, {
                ishead : false,
                colAttrs : this.body.colAttrs,
                editable: true,
            }));

            this.body.insertRow(row+1, newRow);

        }.bind(this));

    }
    
}