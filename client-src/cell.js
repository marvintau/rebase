/**
 * Cell class
 * 
 * stores and modifies the cell data and attributes,
 * and renders the DOM element in table.
 */

export default class Cell {

    constructor(name, data, attr){

        let primTypeDict = {
            string  : 1,
            number  : 2,
            boolean : 3
        };

        if ((data !== null) && !(typeof data in primTypeDict))
            throw TypeError('Cell: data is not primitive: ', data);

        this.name = name;
        this.data = data;
        this.attr = attr;

    }

    /**
     * set the cell data.
     * @param {any} data 
     */
    setData(data){
        this.data = data;
    }

    /**
     * set the cell attribute
     * @param {Object} attr attribute
     */
    setAttr(attr){
        Object.assign(this.attr, attr);
    }

    render(){
        let cellDom = document.createElement('td');
        $(cellDom).attr(this.attr).addClass(`${this.attr.type}`).text(this.data);
        return cellDom;
    }

}