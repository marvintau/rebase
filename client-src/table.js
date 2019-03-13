import { flat, layer } from "./locus.js";
import Table from './table.js';
import Row from "./row.js";

function genHeadCell(cell) {
    let cellDom = document.createElement('th');
    $(cellDom).attr(cell.attr).addClass(`th-header`).text(cell.attr.def);
    return cellDom;
}

function genHeadRow(row, control) {
    console.log(row);
    return row.cols.filter((cell, i) => (!control[i].hide) && (!control[i].hideNull) && (!control[i].hideBool))
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
    let tr = document.createElement('tr');
    if (data.length == 1) {
        $(tr).append(`<th class="edit-bar th-header">编辑</th>`)
            .append(genHeadRow(data[0], control).map(e => $(e)));
    }
    $(headDom).append($(tr));
}

export default class Table {
    
    constructor (data, typeDefault, colsTypeDict, name){
        this.name = name ? name : "";

        let head, body;

        if (data.every(e => typeof e === "object")) {
            if(data.length > 0){
                head = layer(data[0]),
                body = data.map(e => Object.values(flat(e)));
            }
        }
        else if (data.constructor === Object) {
                head = layer(data),
                body = transpose(data);
        } else {
            throw new TypeError('Ledger: unrecognized data. It must be Array of objects, or Object of arrays');
        }

        this.head = head.map((row) => new Row(name, row));
        this.body = body.map((row) => new Row(name, row));

        this.size = {rows: body.length, cols:body[0].length}

        this.body.forEach((row, rowNum) => {
            row.setAttr({ row: rowNum});
        })

        this.colTypes = Array(this.size.cols).fill(0).map(e => ({ type: "undefined", def: "undefined", hide: true }));

        let lastRow = this.head[this.head.length - 1].cols;
        lastRow.forEach((e, i) => {
            let typeEntry = colsTypeDict[e.data];
            if (typeEntry) {
                this.colTypes[i] = typeEntry;
                this.colTypes[i].default = typeDefault[typeEntry.type].default;
                Object.assign(e.attr, typeEntry);
            }
        });

        this.forEachCell((cell, _row, col) =>{
            let typeEntry = this.colTypes[col];
            cell.attr.type = typeEntry.type;
            cell.data = (cell.data == null || cell.data == "***") ? typeEntry.default : cell.data;
        })
    }

    forEachCell(func) {
        for (let row = 0; row < this.size.rows; row++)
            for (let col = 0; col < this.size.cols; col++)
                func(this.body[row].cols[col], row, col);
    }

    render(parentDom, spec, title){

        $(parentDom).append(`
        <div id="table-wrapper-${this.name} class="table-wrapper">
            <div id="table-${this.name}-title" class="table-title">${title}</div>
            <div id="table-${this.name}" class="table-outer"></div>
            <div id="table-${this.name}-pagin" class="paginator"</div>
        </div>
        `);

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

        genHead(this.head, thead, this.colTypes);
        genBody(data, tbody, this.colTypes);

        return table;
    }

    bindEvents() {

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