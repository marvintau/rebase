/**
 * A grid is a structure that contains a single array of array, which consists of 
 * dictionary object as its cells. This structure enables you to perform fundamental
 * operations over a table, like inserting or deleting a row or column, or add some
 * attributes to a single row, column or a cell.
 * 
 * Notably, do not mistake the grid with table. A table is constructed with two grids,
 * which represents the table header and body respectively. Table also have some extra
 * behaviours, like exporting to DOM table.
 */

export default class Grid {

    constructor(data){


        if (Array.isArray(data) && data.every(row => Array.isArray(row))){
            if (data.some((v, i, a) => v.length != a[0].length))
                throw new Error("Grid: the initiating array doesn't have same dimension.");    

            this.size = {rows: data.length, cols:data[0].length}
            this.rows = data.map((rows, rowNum) => rows.map((cell, colNum) => ({data: cell, attr:{row:rowNum, col:colNum}})));

            this.colAttrs = Array(this.size.cols).fill(0).map((e)=>({style : ""}));
            this.rowAttrs = Array(this.size.rows).fill(0).map((e)=>({style : ""}));

        } else {
            throw new Error('Grid: the initiating data must be an array of array.');
        }
    }

    restoreData(){
        return this.rows.map(row => row.map(cell => cell.data));
    }

    forEach(func){
        for (let i = 0; i < this.size.rows; i++)
        for (let j = 0; j < this.size.cols; j++)
            func(this.rows[i][j], i, j);
    }

    forEachRow(func){
        this.rows.forEach(func);
    }

    forEachCol(func) {
        for (let i = 0; i < this.size.cols; i++) func(this.rows.map(row => row[i]));
    }

    sliceRow(rowStart, rowEnd){
        let data = this.rows.slice(rowStart, rowEnd).map(row => row.map(cell => cell.data)),
            grid = new Grid(data);
        grid.rowAttrs = this.rowAttrs.slice(rowStart, rowEnd);
        grid.colAttrs = this.colAttrs;
        return grid;
    }

    sliceCol(colStart, colEnd){
        let data = this.rows.map(row => row.slice(colStart, colEnd).map(cell => cell.data)),
            grid = new Grid(data);
        grid.rowAttrs = this.rowAttrs;
        grid.colAttrs = this.colAttrs.slice(colStart, colEnd);
        return grid;
    }

    transpose(){

        let transed = Array(this.size.cols).fill(0).map((e) => Array(this.size.rows));
        this.forEach((e, i, j) => { trans[j][i] = e; });
        this.rows = transed;
    }

    cell(i, j, val){
        if(val !== undefined){
            this.rows[i][j].data = val;
        }
        return this.rows[i][j].data;
    }

    attr(i, j, attrs){
        if(attrs !== undefined){
            Object.assign(this.rows[i][j].attr, attrs);
        }
        return this.rows[i][j].attr;
    }

    attrRow(row, attrs){
        Object.assign(this.rowAttrs[row], attrs);
    }

    attrCol(col, attrs){
        Object.assign(this.colAttrs[col], attrs);
    }

    attrAll(attrs){
        this.forEach((elem) => { Object.assign(elem.attr, attrs); });
    }

    firstRow(){
        if (this.size.rows < 1) throw new Error('Grid.firstRow: rows less than 1')
        return this.rows[0];
    }
    lastRow(){
        if (this.size.rows < 1) throw new Error('Grid.firstRow: rows less than 1')
        return this.rows[this.size.rows - 1];
    }

    deleteRow(index){
    }

    insertRow(index, array){
        array = (array !== undefined) ? array : Array(this.size.cols).fill(0);
        return this.rows.splice(index, 0, array);
    }

    JoinLeft(){}

    JoinRight(){}

    JoinTop(){}

    JoinBottom(){}
}