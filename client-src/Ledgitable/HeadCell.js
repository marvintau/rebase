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
        this.state = {filtering: false};
        
        this.setFilter = this.setFilter.bind(this);
    }

    setFilter(){
        this.setState({filtering: !this.state.filtering});
    }

    render() {

        const {data, attr, columnEditing, sortMethod, filterColumn, toggleFold, gatherColumn} = this.props;
        let condElems = [];
        if(attr.filter.text === ''){
            let text = attr.gathered ? "取消聚合" : "按此列聚合";
            condElems.push(<button className="btn-sm btn-modify btn-info" onClick={(e) =>gatherColumn(data)} key="0">{text}</button>);
        }
        if(this.state.filtering){
            condElems.push(<div  key="1">
                <input autoFocus
                    type="text"
                    className="input"
                    placeholder="按回车键确认"
                    defaultValue={attr.filter.text}
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

        if (!attr.editing) {
            return (<th type={attr.type} className={"th-header "+attr.type} onDoubleClick={(e)=>{columnEditing(data);}}>{title}</th>);
        } else {
            return (<th type={attr.type} className={"th-header "+attr.type} onDoubleClick={(e)=>{columnEditing(data);}}>
            {title}
            <div>   
                {/* <button className="btn-sm btn-modify btn-warning" onClick={(e) => sortColumn(data)}> {nextSort[attr.sorted]} </button> */}
                <SortButton sortMethod={sortMethod} sortState={attr.sorting} colName={data}/>
                <button
                    className="btn-sm btn-modify btn-primary"
                    onClick={(e) =>this.setFilter()} key="0"
                >{attr.filter.text==="" ? "添加筛选" : "更改筛选"}</button>
                {condElems}
            </div>
            </th>);
        }
    }
}
