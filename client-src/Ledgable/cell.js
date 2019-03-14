/**
 * Cell class
 * 
 * stores and modifies the cell data and attributes,
 * and renders the DOM element in table.
 */

export default class Cell {

    constructor(name, data, attr){

        attr = attr ? attr : {};

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

        $(cellDom).dblclick(function (e) {
            switch (this.attr.type) {
                case "int":
                case "float":
                case "smallint":
                case "tinyint":
                case "varchar":
                case "money":
                    $(cellDom).empty();
                    $(cellDom).append(`<input value="${this.data}"></input>`);
                    console.log(cellDom, "cellDom");
                    cellDom.firstChild.focus();
                    break;
            }
        }.bind(this))
            .focusout(function (e) {
            let elem = e.target.parentElement;
            let content = elem.firstChild.value;
    
            if ($(elem).attr('type').includes('int') || $(elem).attr('type') == 'money') {
                if (!isNaN(content)) {
                    console.log(content);
                    this.setData(parseFloat(content));
                    elem.innerText = content;
                } else
                    elem.innerHTML = `<span style="color:red;">${content}</span>`;
            } else {
                elem.innerText = content;
                this.setData(content);
            }
        }.bind(this));

        return cellDom;
    }

}