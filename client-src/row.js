import Cell from "./cell.js";

/**
 * Row class
 * 
 * stores and modifies a row in a table. Notably the row doesn't
 * hold any attribute information. It accepts the row attributes
 * just for initiating cells, and rendering.
 */

export default class Row {

    constructor (name, rowData){

        this.name = name;
        this.cols = rowData.map((cell, i) => new Cell(name, cell, {col: i}));
    }

    /**
     * set attributes for cells.
     * @param {Array} attr attributes
     */
    setAttr(attr){
        for (let i = 0; i < this.cols.length; i ++){
            Object.assign(this.cols[i].attr, attr);
        }
    }

    setRowAttr(attr) {
        for (let i = 0; i < this.cols.length; i++) {
            Object.assign(this.cols[i].attr, attr[i]);
        }
    }

    /**
     * render the DOM object of cells.
     * 
     * Note: It's highly possible that the outer table using this class would
     * append and prepend editing cells in rows. Thus this function returns
     * an array instead of an TR object.
     * 
     * @returns {Array} cell DOM array
     */
    render(control) {

        return this.cols.filter((cell, i) => (!control[i].hide) && (!control[i].hideNull) && (!control[i].hideBool))
        .map(cell => cell.render());

    }
}
