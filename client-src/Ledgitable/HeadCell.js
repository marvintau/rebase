import {Component} from "react";

export default class HeadCell extends Component {
    
    constructor(props, context){
        super(props, context);
        this.state = {filtering: false};
        
        this.setFilter = this.setFilter.bind(this);
    }

    setFilter(){

        this.setState({filtering: !this.state.filtering});
    }

    render() {

        let nextSort = {
            "NONE"       : "▲升序排列",
            "ASCENDING"  : "▼降序排列",
            "DESCENDING" : "▲升序排列"
        }

        const {data, attr, col, columnEditing, sortColumn, filterColumn, toggleFold} = this.props;
        let filterElems = [(<button className="btn-sm btn-modify btn-primary" onClick={(e) =>this.setFilter()} key="0">筛选</button>)];
        if(this.state.filtering){
            filterElems.push(<div  key="1">
                <input autoFocus
                    type="text"
                    className="input"
                    placeholder="按回车键确认"
                    defaultValue={attr.filter}
                    onKeyDown={(e) => {
                        if(e.key=="Enter"){
                            filterColumn(col, e.target.value);
                            this.setState({filtering: false});
                        }
                    }}
                ></input>
            </div>)
        }

        let title = attr.def ? attr.def : data;

        if(attr.fold){
            return (<th type={attr.type} className={"th-header fold "+attr.type} onDoubleClick={(e)=>{toggleFold(data);}}></th>);
        } else if (!attr.editing) {
            return (<th type={attr.type} className={"th-header "+attr.type} onDoubleClick={(e)=>{columnEditing(data);}}>{title}</th>);
        } else {
            return (<th type={attr.type} className={"th-header "+attr.type} onClick={(e)=>{columnEditing(data);}}>
            {title}
            <div>
                <button className="btn-sm btn-modify btn-warning" onClick={(e) => sortColumn(data)}> {nextSort[attr.sorted]} </button>
                <button className="btn-sm btn-modify btn-danger" onClick={(e) => toggleFold(data)}>折叠</button>
                {filterElems}
            </div>
            </th>);
        }
    }
}
