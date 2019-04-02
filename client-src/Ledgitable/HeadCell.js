import {Component} from "react";

class SortButton extends Component {
    render(){
        let {sortMethod, sortState, colName} = this.props;

        if (sortState === undefined){
            return(<button
                className="btn-sm btn-modify btn-warning"
                onClick={(e) => sortMethod("addSort", colName)}
                >添加排序</button>)
        } else {
            return(<button
                className="btn-sm btn-modify btn-warning"
                onClick={(e) => sortMethod("toggleSort", colName)}
                > {`${sortState.isDesc ? "▲升序排列" : "▼降序排列"} ${sortState.keyIndex+1}`}
                </button>)
        }
    }
}

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

        const {data, attr, columnEditing, sortMethod, filterColumn, toggleFold, aggregateColumn} = this.props;
        let condElems = [];
        if(attr.filter === ''){
            condElems.push(<button className="btn-sm btn-modify btn-info" onClick={(e) =>aggregateColumn(data)} key="0">聚合</button>);
        }
        if(this.state.filtering){
            condElems.push(<div  key="1">
                <input autoFocus
                    type="text"
                    className="input"
                    placeholder="按回车键确认"
                    defaultValue={attr.filter}
                    onKeyDown={(e) => {
                        if(e.key=="Enter"){
                            console.log(data);
                            filterColumn(data, e.target.value);
                            this.setState({filtering: false});
                        }
                    }}
                ></input>
            </div>)
        }

        let title = attr.def ? attr.def : data;

        if(attr.folded){
            return (<th type={attr.type} className={"th-header fold "+attr.type} onDoubleClick={(e)=>{toggleFold(data);}}></th>);
        } else if (!attr.editing) {
            return (<th type={attr.type} className={"th-header "+attr.type} onDoubleClick={(e)=>{columnEditing(data);}}>{title}</th>);
        } else {
            return (<th type={attr.type} className={"th-header "+attr.type} onDoubleClick={(e)=>{columnEditing(data);}}>
            {title}
            <div>   
                {/* <button className="btn-sm btn-modify btn-warning" onClick={(e) => sortColumn(data)}> {nextSort[attr.sorted]} </button> */}
                <SortButton sortMethod={sortMethod} sortState={attr.sorting} colName={data}/>
                <button className="btn-sm btn-modify btn-primary" onClick={(e) =>this.setFilter()} key="0">筛选</button>
                <button className="btn-sm btn-modify btn-danger" onClick={(e) => toggleFold(data)}>折叠</button>
                {condElems}
            </div>
            </th>);
        }
    }
}
