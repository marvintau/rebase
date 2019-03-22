import {List, Map, fromJS} from 'immutable';

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
      <span className="page-indicator"> {currPage} / {totalPage}</span>
      </div>)
    }
}

class BodyRow extends Component {

    render() {
        const {cols, row, updateCell, columnAttr, insertRecord, removeRecord} = this.props;

        let insertRec = (e) => { insertRecord(row);},
            removeRec = (e) => { removeRecord(row);};

        const number =(<td>{row + 1}</td>);
        const editButton = (<td className="edit-bar">
            <button className="btn-sm btn-modify btn-outline-primary" onClick={insertRec}>插入</button>
            <button className="btn-sm btn-modify btn-outline-danger"  onClick={removeRec}>删除</button>
        </td>)

        const colElems = [];
        for (let colKey in cols){
            colElems.push(<BodyCell
                key={colKey}
                row={row}
                col={colKey}
                data={cols[colKey]}
                attr={columnAttr[colKey]}
                updateCell={updateCell}
            />)
        };
        return (<tr>{number}{editButton}{colElems}</tr>);
    }
}

class HeadRow extends Component {

    render() {
        const {cols, ...rest} = this.props;
        console.log(cols, "headRow");
        const colElems = [];
        for (let colKey in cols){
            colElems.push(<HeadCell data={colKey} attr={cols[colKey]} key={colKey} {...rest}/>);
        }
        return (<tr>
            <HeadCell data="ID" className="edit-bar" attr={({})}/>
            <HeadCell data="编辑" className="edit-bar" attr={({})}/>
            {colElems}</tr>);
    }
}

class TableBody extends Component {
    render(){
        const {rows, startingRow, ...rest} = this.props;
        const rowElems = [];
        rows.forEach((cols, rowNum) => {
            rowElems.push(<BodyRow cols={cols} key={rowNum} row={startingRow+rowNum} {...rest}/>);
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
            head : props.head,
            body : props.body
        }
        this.state.presentBody = this.state.body;
        this.state.totalPage = this.state.body.size / this.state.recordPerPage + 1;

        this.updateCell = this.updateCell.bind(this);
        this.insertRecord = this.insertRecord.bind(this);
        this.removeRecord = this.removeRecord.bind(this);

        this.columnEditing = this.columnEditing.bind(this);
        this.sortColumn = this.sortColumn.bind(this);
        this.filterColumn = this.filterColumn.bind(this);
        this.toggleFold = this.toggleFold.bind(this);

        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    prevPage(){
        let currPage = this.state.currPage;
        this.setState({currPage: currPage == 1 ? 1:currPage-1});
    }
    nextPage(){
        let currPage = this.state.currPage,
            recLength = this.state.body.length,
            recordPerPage = this.state.recordPerPage,
            totalPage = recLength / recordPerPage + 1;
        this.setState({currPage: currPage == totalPage ? currPage : currPage+1});
    }

    toggleFold(col){
        let head = this.state.head,
            fold = head[col].fold;
        head[col].fold = !fold;

        this.setState({head: head});
    }

    columnEditing(col){
        let head = this.state.head;
        console.log(head, col);
        for(let key in head) head[key].editing = false;
        head[col].editing = !head[col].editing;
        this.setState({head: head});
    }

    insertRecord(row){
        let body = this.state.body,
            head = this.state.head;
        body.splice(row+1, 0, Object.map(head, e=>e.default));
        for(let key in head) head[key].filter = "";
        this.setState({
            head: head,
            body: body
        });
        this.applyFilterPaginate();
    }

    removeRecord(row){
        let head = this.state.head,
            body = this.state.body;
        body.splice(row, 1);
        for(let key in head) head[key].filter = "";
        this.setState({
            head: head,
            body: body
        });
        this.applyFilterPaginate();
    }

    updateCell(row, col, data){
        let body = this.state.body;
        body[row][col].data = data;
        this.setState({
            body: body,
            presentBody: body
        });
    }

    sortColumn(col){

        let head = this.state.head,
            body = this.state.body;

        let currSort = head[col].sorted,
            order = currSort == "ASCENDING" ? 1 : -1;

        let nextSort = {
            "NONE": "ASCENDING",
            "ASCENDING" : "DESCENDING",
            "DESCENDING" : "ASCENDING"
        }[currSort];

        head[col].sorted = nextSort;

        body.sort((a, b) => {
            return (a[col] < b[col]) ? -1 * order : 1 * order;
        })
        this.setState({
            body: body,
            presentBody : body
        });
        this.setState({head: head});
    }

    applyFilterPaginate(){
        let head = this.state.head,
            body = this.state.body,
            presentBody = body;

        let makeFilterFunc = (filter) => {
            let func;
            if (filter === ""){
                func = (e) => true;
            } else if (filter[0].match(/(\<|\>)/) && filter.slice(1).match(/ *-?\d*\.?\d*/)){
                func = (e) => {return eval(e+filter)}
            } else {
                func = (e) => e === filter;
            }
            return func;    
        }

        for (let col = 0; col < head.length; col++){
            presentBody = presentBody.filter((rec) => makeFilterFunc(head[col].filter)(rec[col]));
        }

        this.setState({
            presentBody: presentBody,
            currPage : 1
        })
    }

    filterColumn(col, filter){

        let head = this.state.head;
        
        head[col].filter = filter;

        this.setState({
            head: head,
        });

        this.applyFilterPaginate();
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
                    cols={this.state.head}
                    columnEditing={this.columnEditing}
                    sortColumn={this.sortColumn}
                    filterColumn = {this.filterColumn}
                    toggleFold = {this.toggleFold}
                />
                <TableBody
                    name={name}
                    startingRow={startingRecord}
                    rows={this.state.presentBody.slice(startingRecord, endingRecord)}
                    columnAttr={this.state.head}
                    updateCell={this.updateCell}
                    insertRecord={this.insertRecord}
                    removeRecord={this.removeRecord}
                    />
            </table></div>
            <Paginator
                prevPage={this.prevPage}
                nextPage={this.nextPage}
                currPage={currPage}
                totalPage={Math.ceil(this.state.presentBody.size/this.state.recordPerPage)}
            />
        </div>);
    }

}