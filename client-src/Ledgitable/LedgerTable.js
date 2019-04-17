import {Component} from 'react';

import HeadRow from "./HeadRow.js";
import BodyRow from "./BodyRow.js";
import Paginator from "./Paginator.js";

export default class LedgerTable extends Component {

    constructor(props, context){
        super(props, context);

        this.state = {
            currPage: 1,
            table : props.table,
        }
        this.state.totalPage = Math.ceil(this.state.table.body.length / props.recordsPerPage);
        console.log(this.state.table.body.length / props.recordsPerPage);

        this.update = this.update.bind(this);

        this.columnEditing = this.columnEditing.bind(this);
        this.sortMethod = this.sortMethod.bind(this);

        this.gatherColumn = this.gatherColumn.bind(this);

        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
    }

    prevPage(){
        let currPage = this.state.currPage;
        this.setState({currPage: currPage == 1 ? 1:currPage-1});
    }
    nextPage(){
        let currPage = this.state.currPage;

        this.setState({currPage: currPage == this.state.totalPage ? currPage : currPage+1});
    }

    columnEditing(col){
        let head = this.state.table.head;

        for(let key in head) if (key != col) head[key].editing = false;
        head[col].editing = !head[col].editing;
        this.setState({head: head});
    }

    update(method, path, column, data){

        let table = this.state.table;
        table[method](path, column, data);
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

        const {name, recordsPerPage, isReadOnly, tableStyle} = this.props;
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

        let rows = this.state.table.body.slice(startingRecord, endingRecord);

        return(
        <div>
            <div id={tableID} className={tableStyle}>
            <table>
                <thead><HeadRow
                    name={name}
                    isReadOnly={isReadOnly}
                    cols={this.state.table.head}
                    columnEditing={this.columnEditing}
                    sortMethod={this.sortMethod}
                    gatherColumn = {this.gatherColumn}
                /></thead>
                <tbody>
                    {rows.map((row, rowNum) =>
                        (<BodyRow 
                            isReadOnly={isReadOnly}
                            row={row}
                            path={[startingRecord+rowNum]}
                            key={startingRecord+rowNum}
                            columnAttr={this.state.table.head}
                            update={this.update}
                        />)
                    )}
                </tbody>
            </table></div>
            {pager}
        </div>);
    }
}