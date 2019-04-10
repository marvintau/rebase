import {Component} from 'react';

import BodyCell from "./BodyCell.js";
import HeadCell from "./HeadCell.js";

class Paginator extends Component {

    render(){

        let {currPage, totalPage, prevPage, nextPage} = this.props;

        currPage = currPage ? currPage : 1;
        totalPage = totalPage ? totalPage : 1;

        return (<div><div className="btn-group">
          <button className="btn btn-outline-info" onClick={(e)=>{prevPage()}}>&laquo;</button>
          <button className="btn btn-outline-info" onClick={(e)=>{nextPage()}}>&raquo;</button>
      </div>
      <span className="page-indicator">第 {currPage} / {totalPage} 页 </span>
      </div>)
    }
}

class BodyRow extends Component {

    constructor(props, context){
        super(props, context);
        this.state = {
            displayChildren : false,
            displayVouch : false
        }
    }

    toggleDisplayChildren(){
        this.setState({
            displayChildren: !this.state.displayChildren
        })
    }

    toggleDisplayVouch(){
        this.setState({
            displayVouch : ! this.state.displayVouch
        })
    }

    render() {
        const {row, path, updateCell, columnAttr, insertRecord, removeRecord, isReadOnly} = this.props;

        let insertRec = (e) => { insertRecord(path);},
            removeRec = (e) => { removeRecord(path);};
        
        let editButton;
        if(row.children){
            editButton = (
                <button
                className="btn-sm btn-modify btn-info"
                onClick={(e) => {this.toggleDisplayChildren()}}
                >{ this.state.displayChildren ? "收拢" : "展开"}</button>
            )
        } else {
            editButton = [
                <button key={0} className="btn-sm btn-modify btn-outline-primary" onClick={insertRec}>插入</button>,
                <button key={1} className="btn-sm btn-modify btn-outline-danger"  onClick={removeRec}>删除</button>,
            ]
            if (row.voucher){
                editButton.push(<button
                    key={2}
                    className="btn-sm btn-modify btn-outline-info"
                    onClick={(e) =>{this.toggleDisplayVouch()}}
                    >{this.state.displayVouch ? "隐藏凭证" : "查看凭证"}</button>);
            }
        }

        let editCell = isReadOnly ? [] : <td className="edit-bar" key="edit">{editButton}</td> ;

        let editable = row.children === undefined;
        
        const colElems = [];
        for (let colName in row) {
            colElems.push(<BodyCell
                key={colName}
                path={path}
                col={colName}
                data={row[colName]}
                attr={columnAttr[colName]}
                updateCell={updateCell}
                editable={editable}
            />)
        };

        let vouch = [];
        if(this.state.displayVouch && row.voucher){
            vouch.push(<tr><td colSpan={row.keys().length+1}><LedgerTable table={row.voucher} recordsPerPage={10} isReadOnly={true} /></td></tr>)
        }

        let childrenRows = [];
        if(row.children && this.state.displayChildren){
            childrenRows = row.children.map((child, i) => {
                return <BodyRow
                    key={i}
                    row={child}
                    path={path.concat(i)}
                    updateCell={updateCell}
                    columnAttr={columnAttr}
                    insertRecord={insertRecord}
                    removeRecord={removeRecord}
                />
            })
        }

        return ([<tr>{editCell}{colElems}</tr>, vouch, childrenRows]);
    }
}


class HeadRow extends Component {

    render() {
        const {cols, isReadOnly, ...rest} = this.props;
        const colElems = [];
        if(!isReadOnly){
            colElems.push(<HeadCell data="编辑" className="edit-bar" key="edit" attr={({})}/>)
        }
        for (let colKey in cols){
            colElems.push(<HeadCell data={colKey} attr={cols[colKey]} key={colKey} {...rest}/>);
        }
        return (<tr>
            {colElems}</tr>);
    }
}

class TableBody extends Component {
    render(){
        const {rows, isReadOnly, startingRow, ...rest} = this.props;
        const rowElems = [];
        rows.forEach((row, rowNum) => {
            rowElems.push(<BodyRow isReadOnly={isReadOnly} row={row} path={[startingRow+rowNum]} key={startingRow+rowNum} {...rest}/>);
            return true;
        });
        return (<tbody>{rowElems}</tbody>);
    }
}

class TableHead extends Component {
    render(){
        const {cols, isReadOnly, ...rest} = this.props;
        return (<thead><HeadRow isReadOnly={isReadOnly} cols={cols} {...rest}/></thead>);
    }
}

export default class LedgerTable extends Component {

    constructor(props, context){
        super(props, context);

        this.state = {
            currPage: 1,
            table : props.table,
        }
        this.state.totalPage = Math.ceil(this.state.table.body.length / props.recordsPerPage) + 1;
        console.log(this.state.table.body.length / props.recordsPerPage);

        this.updateCell = this.updateCell.bind(this);
        this.insertRecord = this.insertRecord.bind(this);
        this.removeRecord = this.removeRecord.bind(this);

        this.columnEditing = this.columnEditing.bind(this);
        this.sortMethod = this.sortMethod.bind(this);

        this.gatherColumn = this.gatherColumn.bind(this);

        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    prevPage(pager){
        let currPage = this.state.currPage;
        this.setState({currPage: currPage == 1 ? 1:currPage-1});
    }
    nextPage(pager){
        let currPage = this.state.currPage;
        
        this.setState({currPage: currPage == this.state.totalPage ? currPage : currPage+1});
    }

    columnEditing(col){
        let head = this.state.table.head;

        for(let key in head) if (key != col) head[key].editing = false;
        head[col].editing = !head[col].editing;
        this.setState({head: head});
    }

    insertRecord(path){
        let table = this.state.table;
        table.insertRecord(path);
        this.setState({table});
    }

    removeRecord(path){
        let table = this.state.table;
        table.removeRecord(path);
        this.setState({table});
    }

    updateCell(path, col, data){

        let table = this.state.table;
        table.updateCell(path, col, data);
        this.setState({table});

    }

    sortMethod(method, col){

        console.log(method);
        let table = this.state.table;
        table[method](col);

        this.setState({
            table: table
        });
    }

    gatherColumn(col){
        let table = this.state.table;
        
        table.setGather(col);
        this.setState({table});
    }

    render() {

        const {name, recordsPerPage, isReadOnly} = this.props;
        let tableID = `table-${name}`;

        let currPage = this.state.currPage,
            startingRecord = (currPage-1) * recordsPerPage,
            endingRecord = startingRecord + recordsPerPage;

        let pager = this.state.totalPage > 1 ? (<Paginator
            prevPage={this.prevPage}
            nextPage={this.nextPage}
            currPage={currPage}
            totalPage={this.state.totalPage}
        />) : [];

        return(
        <div>
            <div id={tableID} className="table-outer">
            <table>
                <TableHead
                    name={name}
                    isReadOnly={isReadOnly}
                    cols={this.state.table.head}
                    columnEditing={this.columnEditing}
                    sortMethod={this.sortMethod}
                    gatherColumn = {this.gatherColumn}
                />
                <TableBody
                    name={name}
                    isReadOnly={isReadOnly}
                    startingRow={startingRecord}
                    rows={this.state.table.presBody.slice(startingRecord, endingRecord)}
                    columnAttr={this.state.table.head}
                    updateCell={this.updateCell}
                    insertRecord={this.insertRecord}
                    removeRecord={this.removeRecord}
                    />
            </table></div>
            {pager}
        </div>);
    }

}