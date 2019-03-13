/**
 * Head class for table.
 */
import {flat, layer} from "./locus.js"
import Cell from "./cell.js";

export default class Head {

    /**
     * initialize the table header. An array means the table is "flat", as well
     * as a flat object (map), while a nested Object could mean a layered header.
     * 
     * @param {Object|Array} header the input could be either an object or array.
     */
    constructor(name, header){

        this.name = name;

        if (Array.isArray(header)){
            this.rows = [new Row(name, header)];
        } else {
            // note: here's an unsolved problem that the flatten object doesn't
            //       necessarily have same order with original one.
            this.rows = layer(flat(header)).map(headRow => new Row(name, headRow));
        }
    }

    attr(attr) {
        this.rows[this.rows.length - 1].attr(attr);
    }

    render() {

        let thead = document.createElement('thead');
        if (this.rows.length == 1) {
            let tr = this.rows[0].render();
        }
            
    }

}