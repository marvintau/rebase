import React from 'react';
import Row from './Row';
import styled from 'styled-components';

const ENTRIES_PER_PAGE = 15;

const PaginatorTR = styled.tr`
    width: 100%;
    font-family: 'Optima';
    font-weight: 300;
`

const PaginatorTD = styled.div`
    border-top: 1px solid black !important;
    width: 100%;
    display: flex;
    justify-content: space-between;

    & div {
        text-align: center;
        padding: 10px;
    }
`

const Button = styled.div`

    user-select: none;

    &:hover {
        background-color: #DEF9F3;
        cursor: pointer;
    }
`


export default class Rows extends React.PureComponent {
    constructor(props){
        super(props);

        this.state = {
            data : props.data,
            page : 0,
            expanded: -1
        }
    }

    static getDerivedStateFromProps(props, state){
        if(!state.fromInside){
            // console.log(props.data.map(e => e.cols.me.valueOf()), state.data.map(e => e.cols.me.valueOf()), 'list');
            if (props.data !== state.data){
                return {
                    data: props.data,
                    fromInside : false
                }
            }
        } else {
            return {...state, fromInside: false}
        }
        return state;
    }
    

    // a generic method of updating the data in in-place manner
    // and fire re-rendering. This method will be passed to Row
    // component and get called if necessary.

    // e.g. the operation fired by a Row, that modifies the order
    // of list, can be achieved by calling this function.

    // You might notice that Rows doesn't call an update method
    // of its parent. Because we only permit a Row calling its
    // parental Rows, meanwhile Rows shouldn't modify its parent
    // row.

    updateRows = (operation, args) => {
        
        if (operation === 'insert') {
            args.push(this.props.head.createRecord());
        }
        let data = this.state.data[operation](...args);

        this.setState({
            data,
            fromInside: true
        })
    }

    updateRowsExpanded = (rowIndex) => {

        let {expanded} = this.state;

        this.setState({
            expanded: expanded === rowIndex ? -1 : rowIndex,
            fromInside: true
        });
    }

    turnPage = (direction) => {

        let {data, page} = this.state,
            pages = Math.ceil(data.length / ENTRIES_PER_PAGE);

        if (direction > 0) {
            this.setState({
                page : Math.min(pages - 1, page + 1),
                fromInside: true
            })
        } else {
            this.setState({
                page: Math.max(0, page - 1),
                fromInside: true
            })
        }
    }

    render(){
        let {head, colSpan, tableAttr, level=0} = this.props;
        let {data, page, expanded} = this.state;

        let {autoExpanded} = tableAttr;

        let rowProps = {
            head,
            level,
            tableAttr,
            rowsExpanded: expanded,
            updateRows: this.updateRows,
            updateRowsExpanded: this.updateRowsExpanded,
        }

        if (expanded === -1 || autoExpanded){

            let paginator = <PaginatorTR key={'tab'}>
                <td colSpan={colSpan} style={{bottom: '0px'}}><PaginatorTD>
                    <Button onClick={() => this.turnPage(-1)}>前一页</Button>
                    <div>当前第{page+1}页，共{Math.ceil(data.length/ENTRIES_PER_PAGE)}页，{data.length}个条目</div>
                    <Button onClick={() => this.turnPage(1)}>后一页</Button>
                </PaginatorTD></td>
            </PaginatorTR>

            let elems;
            if((data.length <= ENTRIES_PER_PAGE) || autoExpanded){
                elems = data.map((entry, rowIndex) => {
                    return <Row
                        key={rowIndex}
                        rowIndex={rowIndex}
                        data={entry}
                        {...rowProps}
                    />
                })
                return elems;
            } else {
                let {page} = this.state;
                elems = data.slice(page*ENTRIES_PER_PAGE, (page+1)*ENTRIES_PER_PAGE).map((entry, rowIndex) => {
                    return <Row
                        key={rowIndex}
                        rowIndex={rowIndex+page*ENTRIES_PER_PAGE}
                        data={entry}
                        {...rowProps}
                    />
                })
                return [elems, paginator];
            }
            
        } else {
            return [<Row
                key={expanded}
                rowIndex={expanded}
                data={data[expanded]}
                {...rowProps}
            />]
        }

    }
}