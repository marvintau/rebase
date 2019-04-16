import {Component} from "react";

class SortButton extends Component {

    constructor(props, contexts){
        super(props, contexts);
        this.state = {hover: false};

        this.mouseOver = this.mouseOver.bind(this);
        this.mouseOut = this.mouseOut.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.keyUp = this.keyUp.bind(this);
    }

    mouseOver(){
        this.setState({hover: true});
    }

    mouseOut(){
        this.setState({hover: false});
    }

    keyDown(event){
        if(event.key === "Shift") this.setState({keyDown: true});
    }

    keyUp(event){
        if(event.key === "Shift") this.setState({keyDown: false});
    }

    render(){
        let {sortMethod, sortState, colName} = this.props;

        if (sortState === undefined){
            return(<button
                className="btn-sm btn-modify btn-warning"
                onClick={(e) => sortMethod("addSort", colName)}
                >添加排序</button>)
        } else {

            let cond = this.state.hover && this.state.keyDown,
                method = cond ? "removeSort" : "toggleSort",
                display = cond ? "  去掉排序  " : `${sortState.isDesc ? "▲升序排列" : "▼降序排列"} ${sortState.keyIndex+1}`;

            return(<button
                className="btn-sm btn-modify btn-warning"
                onClick={(e) => sortMethod(method, colName)}
                onMouseOver={this.mouseOver}
                onMouseOut={this.mouseOut}
                onKeyDown={this.keyDown}
                onKeyUp={this.keyUp}
                >{display}
                </button>)
        }
    }
}

export default class HeadCell extends Component {
    
    constructor(props, context){
        super(props, context);        
    }

    render() {

        const {data, attr, columnEditing, sortMethod, gatherColumn} = this.props;
        let condElems = [];

        if(attr.operations && ('gather' in attr.operations)){
            let text = attr.gathered ? "取消聚合" : "按此列聚合";
            condElems.push(<button className="btn-sm btn-modify btn-info" onClick={(e) =>gatherColumn(data)} key="0">{text}</button>);
        }

        let title = attr.def ? attr.def : data;

        if (!attr.editing) {
            return (<th type={attr.type} className={"th-header "+attr.type} onDoubleClick={(e)=>{columnEditing(data);}}><div>{title}</div></th>);
        } else {
            return (<th type={attr.type} className={"th-header "+attr.type}>
            <div onDoubleClick={(e)=>{columnEditing(data);}}>{title}</div>
            <div>   
                <SortButton sortMethod={sortMethod} sortState={attr.sorting} colName={data}/>
                {condElems}
            </div>
            </th>);
        }
    }
}
