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

    constructor(table){

        let primTypeDict = {
            string  : 1,
            number  : 2,
            boolean : 3
        };

        if (Array.isArray(table) && table.every(row => Array.isArray(row))){
            if (table.some((v, i, a) => v.length != a[0].length))
                throw new Error("Grid: the initiating array doesn't have same dimension.");    

            if (table.some((v) => v.some((e) => !(typeof e in primTypeDict))))
                throw new Error("Grid: some of the element is not primitive.");    

            this.size = {rows: table.length, cols:table[0].length}
            this.rows = table.map(rows => rows.map(cell => ({data: cell, attr:{}})));
            this.cols = Array(this.size.cols).fill(0).map((e) => Array(this.size.rows));

            this.colAttrs = Array(this.size.cols).map(e=>{});
            this.rowAttrs = Array(this.size.rows).map(e=>{});

            for (let i = 0; i < this.size.rows; i++)
            for (let j = 0; j < this.size.cols; j++)
                this.cols[j][i] = this.rows[i][j];

        } else {
            throw new Error('Grid: the initiating data must be an array of array.');
        }
    }

    forEach(func){
        for (let i = 0; i < this.size.rows; i++)
        for (let j = 0; j < this.size.cols; j++)
            func(this[i][j], i, j);
    }

    sliceRow(rowStart, rowEnd){
        return this.rows.slice(rowStart, rowEnd);
    }

    sliceCol(colStart, colEnd){
        return this.rows.map(row => row.slice(colStart, colEnd));
    }

    transpose(){
        [this.rows, this.cols] = [this.cols, this.rows];
    }

    set(i, j, val){
        this.rows[i][j].data = val;
    }

    attr(i, j, attrs){
        Object.assign(this.rows[i][j].attr, attrs);
    }

    attrRow(row, attrs){
        Object.assign(this.rowAttrs[row], attrs);
    }

    attrCol(col, attrs){
        Object.assign(this.rowAttrs[col], attrs);
    }

    firstRow(){
        if (this.size.rows < 1) throw new Error('Grid.firstRow: rows less than 1')
        return this.rows[0];
    }
    lastRow(){
        if (this.size.rows < 1) throw new Error('Grid.firstRow: rows less than 1')
        return this.rows[this.size.rows - 1];
    }
    firstCol(){
        if (this.size.cols < 1) throw new Error('Grid.firstRow: cols less than 1')
        return this.cols[0];
    }
    lastCol(){
        if (this.size.cols < 1) throw new Error('Grid.firstRow: cols less than 1')
        return this.cols[this.size.cols - 1];
    }

    JoinLeft(){}

    JoinRight(){}

    JoinTop(){}

    JoinBottom(){}
}