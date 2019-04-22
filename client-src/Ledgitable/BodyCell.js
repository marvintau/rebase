import React from 'react';

export default class BodyCell extends React.Component {
    
    constructor(props, context){
        super(props, context);

        this.state = {editing: false, valid:true};
        this.toggleEditing = this.toggleEditing.bind(this);
    }

    toggleEditing(){
        if(this.props.editable)
            this.setState({editing: !this.state.editing});
    }

    render() {

        const {data, attr, path, col, update} = this.props;
        let displayedData = (data === null || data === undefined) ? '空' : 
                            (data.data !== null && data.data !== undefined ) ? data.data : data;

        let props = {
            autoFocus : true,
            type : "text",
            placeholder : this.props.type,
            defaultValue : this.props.data,
            onBlur: this.toggleEditing,
            onKeyDown : (e) => {if (e.key == "Escape" || e.key == "Enter"){
                e.preventDefault();
                if(e.key === "Enter") update && update('update', path, col, e.target.value);
                this.toggleEditing();
            }}
        };

        if(!this.state.editing){
            return (<td col={col} onDoubleClick={this.toggleEditing} type={attr.type} className={attr.type}>{displayedData}</td>);
        } else {
            switch(this.props.type){
                default: 
                    return (<td col={col}>
                        <input className="cell-editing" {...props} />
                    </td>)
            }
        }
        
    }
}