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

        const {data, attr, col, row, updateCell, aggregate} = this.props;

        let displayedData = (data === null) ? data : data.data ? data.data : data;

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
            return (<td col={col} row={row} onDoubleClick={this.toggleEditing} type={attr.type} className={attr.type}>{displayedData}</td>);
        } else {
            switch(this.props.type){
                default: 
                    return (<td col={col} row={row}>
                        <input className="cell-editing" {...props} />
                        <button className="btn-sm btn-info agg" onClick={(e)=>aggregate(e.target.value)}>聚合</button>
                    </td>)
            }
        }
        
    }
}

BodyCell.propTypes = {
    col : PropTypes.string.isRequired,
    row : PropTypes.number.isRequired
};
