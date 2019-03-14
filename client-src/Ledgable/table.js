import { flat, layer } from "./locus.js";
import Table from './table.js';
import Cell from "./cell.js";

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
    $(cellDom).append(`<button class="btn-sm btn-modify btn-outline-primary" edit-type="add"    row="${rec[0].attr.row}">插入</button>`);
    $(cellDom).append(`<button class="btn-sm btn-modify btn-outline-danger"  edit-type="remove" row="${rec[0].attr.row}">删除</button>`);
    $(cellDom).addClass('edit-bar');

    tr.appendChild(cellDom);

    let domArray = rec
    .filter((e, i)=>(!control[i].hide) && (!control[i].hideNull) && (!control[i].hideBool))
    .map(e=>e.render());

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
    
    constructor (data, colsTypeDict, typeDefault, name){
        this.name = name ? name : "";
        this.updateData(data, colsTypeDict, typeDefault)
    }

    /**
     * updateData
     * ----------
     * update the whole table. When initializing or refreshing the whole table.
     * @param {Array} data table data
     * @param {PlainObject} colsTypeDict column type dictionary from external
     * @param {PlainObject} typeDefault type default values
     */
    updateData(data, colsTypeDict, typeDefault){
        
        let head;
        if (data.length > 0 && data.every(e => typeof e === "object")) {
            head = layer(data[0])
        } else if (data.constructor === Object) {
            head = layer(data)
        } else {
            throw new TypeError('Ledger: unrecognized data. It must be Array of objects, or Object of arrays');
        }
        console.log(head);
        this.head = head.map((row) => row.map((cell) => new Cell(name, cell)));

        // ColDict is a reversed index, which used to locate the column number
        // by the column/field name. Since we transform the object into array,
        // which the order of the entry is not always guaranteed same, we use
        // colDict to locate the column instead of use column number directly.
        this.colDict = {};

        for (let i = 0, headLast = head[head.length-1]; i < headLast.length; i++)
            this.colDict[headLast[i]] = i;
        console.log(this.colDict);

        this.updateColTypes(colsTypeDict, typeDefault);
        this.updateBody(data);
    }

    /**
     * updateColTypes
     * ------------
     * assign the columns with corresponding type from external type dictionary.
     * 
     * @param {PlainObject} colsTypeDict column type dictionary, from external
     * @param {PlainObject} typeDefault default value of each type
     */
    updateColTypes(colsTypeDict, typeDefault){
        this.colTypes = this.head[0].map(e => ({ type: "undefined", def: "undefined", hide: true }));

        let lastRow = this.head[this.head.length - 1];
        lastRow.forEach((e, i) => {
            let typeEntry = colsTypeDict[e.data];
            if (typeEntry) {
                this.colTypes[i] = typeEntry;
                this.colTypes[i].default = typeDefault[typeEntry.type].default;
                Object.assign(e.attr, typeEntry);
            }
        });
    }

    /**
     * updateBody
     * ----------
     * Update the data only. Useful when refreshing data, but not changing columns.
     * 只更新表中数据，不更新表头及各列的数据类型，适合只有数据发生变动时的更新
     * 
     * Note: this can be considered as a dirty operation, because it doesn't check
     *       col length or type conflict. So make sure the data is handled properly
     *       before calling this method.
     *       把它考虑为脏操作，因为它不会检查列数及可能存在的类型冲突。所以请确保在调
     *       用之前将数据处理好。
     * 
     * @param {Array} data initial table data
     */
    updateBody(data){
        let body;
        if (data.length > 0 && data.every(e => typeof e === "object")) {
            body = data.map(e => Object.values(flat(e)));
        } else if (data.constructor === Object) {
            body = transpose(data);
        } else {
            throw new TypeError('Ledger: unrecognized data. It must be Array of objects, or Object of arrays');
        }

        this.body = body.map((row, rowNum) => row.map((cell, colNum) => new Cell(name, cell, {row: rowNum, col: colNum})));

        this.size = {rows: body.length, cols:body[0].length}

        this.forEachCell((cell, _row, col) =>{
            let typeEntry = this.colTypes[col];
            cell.attr.type = typeEntry.type;
            cell.data = (cell.data == null) ? typeEntry.default : cell.data;
        })

        this.bodyDisplay = this.body;
    }

    /**
     * filter
     * -------
     * 对现有数据进行过滤并更新到展示数据，不会影响到原始数据
     * 
     * @param {function} func function to manipulate data
     */
    filter(func){
        let result = func(this.body);
        this.bodyDisplay = result;
    }

    forEachCell(func) {
        for (let row = 0; row < this.size.rows; row++)
            for (let col = 0; col < this.size.cols; col++)
                func(this.body[row][col], row, col);
    }

    render(spec, title, parentDom){

        if ($(`#table-wrapper-${this.name}`).length == 0){
            $(parentDom).append(`
            <div id="table-wrapper-${this.name}" class="table-wrapper">
            </div>`)
        }
        let $wrapper = $(`#table-wrapper-${this.name}`);

        $wrapper.empty().append(`
        <div id="table-${this.name}-title" class="table-title">${title}</div>
        <div id="table-${this.name}" class="table-outer"></div>
        <div id="table-${this.name}-pagin" class="paginator"</div>
        `);
        
        console.log($(`#table-wrapper-${this.name}`), "render");

        $(`#table-${this.name}-pagin`).pagination({
            dataSource: this.bodyDisplay,
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
                this.colTypes[i].hideNull = data.map(row => row[i].data).every((v)=> (v==="无" || !v));
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