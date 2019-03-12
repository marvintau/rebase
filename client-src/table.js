import Grid from "./grid.js";
import Row from "./row.js";

function genHeadCell(cell) {
    let cellDom = document.createElement('th');
    $(cellDom).attr(cell.attr).addClass(`th-header`).text(cell.attr.def);
    return cellDom;
}


function genHeadRow(row, control) {
    return row.filter((cell, i) => (!control[i].hide) && (!control[i].hideNull) && (!control[i].hideBool))
    .map(cell => genHeadCell(cell));
}

function genBodyRow(rec, control){

    let cellDom,
        tr = document.createElement('tr');

    cellDom = document.createElement("td");
    $(cellDom).append(`<button class="btn-sm btn-modify btn-outline-primary" edit-type="add"    row="${rec.cols[0].attr.row}">插入</button>`);
    $(cellDom).append(`<button class="btn-sm btn-modify btn-outline-danger"  edit-type="remove" row="${rec.cols[0].attr.row}">删除</button>`);
    $(cellDom).addClass('edit-bar');

    tr.appendChild(cellDom);

    let domArray = rec.render(control);

    $(tr).append(domArray.map(e => $(e)));

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
function genBody(data, bodyDom, control){

    try {
        for (let i = 0; i < data.length; i++){
            bodyDom.appendChild(genBodyRow(data[i], control));
        }
    } catch (e) {
        console.error(e,"genTR", data);
    }
}


function genHead(data, headDom, control) {
    console.log(data);
    let tr = document.createElement('tr');
    $(tr).append(`<th class="table th-header">编辑</th>`)
        .append(genHeadRow(data[0], control).map(e => $(e)));
    $(headDom).append($(tr));
}

export default class Table {
    
    constructor (head, body, name){
        this.name = name ? name : "";

        this.head = new Grid(head);
        this.body = body.map((row) => new Row(name, row));

        this.size = {rows: body.length, cols:body[0].length}
        
        this.head.attrAll({ rowspan: 1, colspan: 1 });

        this.body.forEach((row, rowNum) => {
            row.setAttr({ row: rowNum});
        })
    }

    forEachCell(func) {
        for (let row = 0; row < this.size.rows; row++)
            for (let col = 0; col < this.size.cols; col++)
                func(this.body[row].cols[col], row, col);
    }

    render(parentDom, spec){

        $(parentDom).append(`<div id="table-wrapper-${this.name}">
            <div id="table-${this.name}" class="table-outer"></div>
            <div id="table-${this.name}-pagin"></div>
        </div>`);

        $(`#table-${this.name}-pagin`).pagination({
            dataSource: this.body,
            pageSize: 50,
            showGoInput: true,
            showGoButton: true,
            showPageNumbers: false,
            showNavigator: true,

            callback: (data) => {

                let table = this.renderPage(data, spec);
                $(`#table-${this.name}`).empty();
                $(`#table-${this.name}`).append(table);
                this.bindEvents();
            }
        })
    }


    renderPage(data, spec){

        let table   = document.createElement('table'),
            thead   = document.createElement('thead'),
            tbody   = document.createElement('tbody');
        
        table.appendChild(thead);
        table.appendChild(tbody);
        
        if (spec.hideNull){
            for (let i = 0; i < this.size.cols; i++){
                this.colTypes[i].hideNull = data.map(row => row.cols[i].data).every((v)=> (v==="无" || !v));
            }
        }

        if (spec.hideBool){
            this.colTypes.forEach(e => e.hideBool = e.type === 'bit');
        }

        genHead(this.head.rows, thead, this.colTypes);
        genBody(data, tbody, this.colTypes);

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
            
            let cell = this.body[row][col];
            console.log(cell);
            if ($(elem).attr('type').includes('int') || $(elem).attr('type') == 'money'){
                if (!isNaN(content)){
                    console.log(content);
                    this.body[row][col].setData(parseFloat(content));
                    elem.innerText = content;
                }else
                    elem.innerHTML = `<span style="color:red;">${content}</span>`;
            } else {
                elem.innerText = content;
                this.body[row][col].setData(content);
            }
        })

        $('button[edit-type="remove"]').click(function(e){

            let row = parseInt($(e.target).attr('row'));
            $(e.target).parent().parent().get(0).remove();

            $('button[edit-type]').each((i, v) => {
                let currRow = parseInt(v.getAttribute('row'));
                if (currRow >= row) v.setAttribute('row', currRow-1);
            });
            
            return this.body.splice(row, 1);
            
        }.bind(this));

        $('button[edit-type="add"]').click(function(e){

            let row = parseInt($(e.target).attr('row')),
                rowElem = $(e.target).parent().parent();
            // console.log(row);
            $('button[edit-type]').each((i, v) => {
                let currRow = parseInt(v.getAttribute('row'));
                if (currRow >= row) v.setAttribute('row', currRow+1);
            });

            let newRow = new Row(this.name, this.colTypes.map(e => (e.default ? e.default : 0)));
            newRow.setAttr({ row: row });
            newRow.setRowAttr(this.colTypes);
            rowElem.after(genBodyRow(newRow, this.colTypes));
            this.body.splice(row+1, 0, newRow);
    
        }.bind(this));

    }
    
}