import {Component} from 'react';

import BodyCell from "./BodyCell.js";
import HeadCell from "./HeadCell.js";
import { update } from 'immutable';

class Paginator extends Component {

    render(){

        let {currPage, totalPage, prevPage, nextPage} = this.props;

        currPage = currPage ? currPage : 1;
        totalPage = totalPage ? totalPage : 1;

        return (<div><div className="btn-group">
          <button className="btn btn-outline-info" onClick={(e)=>{prevPage()}}>&laquo;</button>
          <button className="btn btn-outline-info" onClick={(e)=>{nextPage()}}>&raquo;</button>
      </div>
      <span className="page-indicator"> {currPage} / {totalPage}</span>
      </div>)
    }
}

class BodyRow extends Component {

    constructor(props, context){
        super(props, context);
        this.state = {
            displayChildren : false
        }
    }

    toggleDisplayChildren(){
        this.setState({
            displayChildren: !this.state.displayChildren
        })
    }

    render() {
        const {row, updateCell, columnAttr, insertRecord, removeRecord} = this.props;

        let insertRec = (e) => { insertRecord(row);},
            removeRec = (e) => { removeRecord(row);};

        let editButton;
        if(!columnAttr.some((e)=>e.folded || e.filtered || e.aggregated)){
            if(row.children){
                editButton = (<td className="edit-bar" key="edit">
                    <button
                    className="btn-sm btn-modify btn-outline-primary"
                    onClick={(e) => {this.toggleDisplayChildren()}}
                    >{ this.state.displayChildren ? "收拢" : "展开"}</button>
                    <button className="btn-sm btn-modify btn-outline-primary" onClick={insertRec}>插入</button>
                </td>)
            } else {
                editButton = (<td className="edit-bar" key="edit">
                    <button className="btn-sm btn-modify btn-outline-danger"  onClick={removeRec}>删除</button>
                </td>)
            }
        }

        const updateEnabled = !columnAttr.some((e)=> e.aggregated);
        
        const colElems = [];
        for (let colName in row) {
            colElems.push(<BodyCell
                key={colName}
                // row={rowNumber}
                col={colName}
                data={row[colName]}
                attr={columnAttr[colName]}
                updateCell={updateCell}
                updateEnabled={updateEnabled}
            />)
        };

        let childrenRows = [];
        if(this.state.displayChildren){
            childrenRows = row.children.map(child => {
                return <BodyRow row={child} updateCell={updateCell} columnAttr={columnAttr} insertReccord={insertRecord} removeRecord={removeRecord} />
            })
        }

        return ([[<tr>{editButton}{colElems}</tr>, childrenRows]]);
    }
}


class HeadRow extends Component {

    render() {
        const {cols, ...rest} = this.props;
        const colElems = [];
        if(!cols.some((e)=>e.folded || e.filtered || e.aggregated)){
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
        const {rows, startingRow, ...rest} = this.props;
        const rowElems = [];
        rows.forEach((row, rowNum) => {
            rowElems.push(<BodyRow row={row} key={rowNum} rowNumber={startingRow+rowNum} {...rest}/>);
            return true;
        });
        return (<tbody>{rowElems}</tbody>);
    }
}

class TableHead extends Component {
    render(){
        const {cols, ...rest} = this.props;
        return (<thead><HeadRow cols={cols} {...rest}/></thead>);
    }
}

export default class LedgerTable extends Component {

    constructor(props, context){
        super(props, context);

        this.state = {
            recordPerPage: 30,
            currPage: 1,
            table : props.table,
        }
        this.state.totalPage = this.state.table.body.size / this.state.recordPerPage + 1;

        this.updateCell = this.updateCell.bind(this);
        this.insertRecord = this.insertRecord.bind(this);
        this.removeRecord = this.removeRecord.bind(this);

        this.columnEditing = this.columnEditing.bind(this);
        this.sortMethod = this.sortMethod.bind(this);
        this.filterColumn = this.filterColumn.bind(this);
        this.toggleFold = this.toggleFold.bind(this);

        this.aggregateColumn = this.aggregateColumn.bind(this);

        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    prevPage(pager){
        let currPage = this.state.currPage;
        this.setState({currPage: currPage == 1 ? 1:currPage-1});
    }
    nextPage(pager){
        let currPage = this.state.currPage,
            recLength = this.state.table.body.length,
            recordPerPage = this.state.recordPerPage,
            totalPage = recLength / recordPerPage + 1;
        this.setState({currPage: currPage == totalPage ? currPage : currPage+1});
    }

    toggleFold(col){
        let head   = this.state.table.head,
            folded = head[col].folded;
        head[col].folded = !folded;

        this.setState({head: head});
    }

    columnEditing(col){
        let head = this.state.table.head;

        for(let key in head) if (key != col) head[key].editing = false;
        head[col].editing = !head[col].editing;
        this.setState({head: head});
    }

    insertRecord(row){
        let body = this.state.table.body,
            head = this.state.table.head;
        body.splice(row+1, 0, Object.map(head, e=>e.default));
        for(let key in head) head[key].filter = "";
        this.setState({
            head: head,
            body: body
        });
    }

    removeRecord(row){
        let head = this.state.table.head,
            body = this.state.table.body;
        body.splice(row, 1);
        for(let key in head) head[key].filter = "";
        this.setState({
            head: head,
            body: body
        });
    }

    updateCell(row, col, data){
        let body = this.state.table.body;
        body[row][col].data = data;
        this.setState({
            body: body,
            presentBody: body
        });
    }

    sortMethod(method, col){

        console.log(method);
        let table = this.state.table;
        table[method](col);

        this.setState({
            table: table
        });
    }

    aggregateColumn(col){
        let head = this.state.table.head,
            body = this.state.table.body;
        
        body = body.gatherAll(col, head);
        head[col].aggregated = true;
        this.setState({
            head,
            body,
            presentBody: body
        });
    }

    filterColumn(col, filter){

        let table = this.state.table;
        table.setFilter(col, filter);
        
        this.setState({ table , currPage: 1});
    }

    render() {

        const {name} = this.props;
        let tableID = `table-${name}`;

        let currPage = this.state.currPage,
            recordPerPage = this.state.recordPerPage,
            startingRecord = (currPage-1) * recordPerPage,
            endingRecord = startingRecord + recordPerPage;

        return(
        <div>
            <div id={tableID} className="table-outer">
            <table>
                <TableHead
                    name={name}
                    cols={this.state.table.head}
                    columnEditing={this.columnEditing}
                    sortMethod={this.sortMethod}
                    filterColumn = {this.filterColumn}
                    toggleFold = {this.toggleFold}
                    aggregateColumn = {this.aggregateColumn}
                />
                <TableBody
                    name={name}
                    startingRow={startingRecord}
                    rows={this.state.table.presBody.slice(startingRecord, endingRecord)}
                    columnAttr={this.state.table.head}
                    updateCell={this.updateCell}
                    insertRecord={this.insertRecord}
                    removeRecord={this.removeRecord}
                    />
            </table></div>
            <Paginator
                prevPage={this.prevPage}
                nextPage={this.nextPage}
                currPage={currPage}
                totalPage={Math.ceil(this.state.table.presBody.length/this.state.recordPerPage)}
            />
        </div>);
    }

}