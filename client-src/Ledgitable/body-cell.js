import {Component} from 'react';
import PropTypes from 'prop-types';

export default class BodyCell extends Component {
    
    constructor(props, context){
        super(props, context);

        this.state = {editing: false, valid:true};
        this.toggleEditing = this.toggleEditing.bind(this);
    }

    toggleEditing(){
        this.setState({editing: !this.state.editing});
    }

    render() {

        const {data, attr, col, row, updateCell} = this.props;
        
        let props = {
            autoFocus : true,
            type : "text",
            placeholder : this.props.type,
            defaultValue : this.props.data,
            onBlur: this.toggleEditing,
            onKeyDown : (e) => {if (e.key == "Escape" || e.key == "Enter"){
                e.preventDefault();
                // console.log(e.target.value);
                if(e.key === "Enter") updateCell && updateCell(row, col, e.target.value);
                this.toggleEditing();
            }}
        };

        if(attr.fold){
            return (<td className="fold" col={col} row={row} ></td>);
        }
        if(!this.state.editing){
            return (<td col={col} row={row} onDoubleClick={this.toggleEditing} type={attr.type} className={attr.type}>{data}</td>);
        } else {
            switch(this.props.type){
                default: 
                    return (<td col={col} row={row}>
                    <input className="cell-editing" {...props} /></td>)
            }
        }
        
    }
}

BodyCell.propTypes = {
    col : PropTypes.number.isRequired,
    row : PropTypes.number.isRequired
};

/**
 * Cell class
 * 
 * stores and modifies the cell data and attributes,
 * and renders the DOM element in table.
 */

// export default class Cell {

//     constructor(name, data, attr){

//         attr = attr ? attr : {};

//         let primTypeDict = {
//             string  : 1,
//             number  : 2,
//             boolean : 3
//         };
//         if ((data !== null) && !(typeof data in primTypeDict))
//             throw TypeError('Cell: data is not primitive: ', data);

//         this.name = name;
//         this.data = data;
//         this.attr = attr;

//     }

//     /**
//      * set the cell data.
//      * @param {any} data 
//      */
//     setData(data){
//         this.data = data;
//     }

//     /**
//      * set the cell attribute
//      * @param {Object} attr attribute
//      */
//     setAttr(attr){
//         Object.assign(this.attr, attr);
//     }

//     render(){
//         let cellDom = document.createElement('td');
//         $(cellDom).attr(this.attr).addClass(`${this.attr.type}`).text(this.data);

//         $(cellDom).dblclick(function (e) {
//             switch (this.attr.type) {
//                 case "int":
//                 case "float":
//                 case "smallint":
//                 case "tinyint":
//                 case "varchar":
//                 case "money":
//                     $(cellDom).empty();
//                     $(cellDom).append(`<input value="${this.data}"></input>`);
//                     console.log(cellDom, "cellDom");
//                     cellDom.firstChild.focus();
//                     break;
//             }
//         }.bind(this))
//             .focusout(function (e) {
//             let elem = e.target.parentElement;
//             let content = elem.firstChild.value;
    
//             if ($(elem).attr('type').includes('int') || $(elem).attr('type') == 'money') {
//                 if (!isNaN(content)) {
//                     console.log(content);
//                     this.setData(parseFloat(content));
//                     elem.innerText = content;
//                 } else
//                     elem.innerHTML = `<span style="color:red;">${content}</span>`;
//             } else {
//                 elem.innerText = content;
//                 this.setData(content);
//             }
//         }.bind(this));

//         return cellDom;
//     }

// }