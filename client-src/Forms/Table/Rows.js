import {Body} from 'persisted';

import React from 'react';
import Row from './Row';
import styled from 'styled-components';

import FilterIcon from './icons/filter.png';
import SortIcon from './icons/sort-ascending.png';

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

const Icon = styled.img`
    width: 25px;
    height: 25px;
    padding: 3px;
    cursor: pointer;

    & {
        opacity: 0.5;
    }

    &:hover {
        background-color: lightsalmon;
        opacity: 1;
    }
`

const Ctrl = styled.div`
    display: flex;
    justify-content: space-around;
    &:hover{
        background-color: moccasin;
    }
`

class SortButton extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            isAscending: true
        }
    }

    toggleOrder = () => {
        let {isAscending} = this.state;
        this.setState({
            isAscending : !isAscending
        })
    }

    render(){
        let {orderFunc} = this.props;
        return <Icon src={SortIcon} onClick={(e) => {
            orderFunc(this.state.isAscending);
            this.toggleOrder();
        }}/>
    }
}

export default class Rows extends React.PureComponent {
    constructor(props){
        super(props);

        this.state = {
            data : props.data,
            shownData : Body.from(props.data),
            page : 0,
            expandedRowIndex: -1
        }
    }

    static getDerivedStateFromProps(props, state){
        if(!state.fromInside){
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
            args.push(this.props.head.createCols());
            console.log(args, 'insert argument')
        }

        let data = this.state.data[operation](...args);

        this.setState({
            data,
            fromInside: true
        })
    }

    updateRowsExpanded = (rowIndex) => {

        let {expandedRowIndex} = this.state;

        expandedRowIndex = expandedRowIndex === rowIndex ? -1 : rowIndex;

        this.setState({
            expandedRowIndex, 
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
        let {head, autoExpanded, editable, expandable} = this.props;
        let {data, page, expandedRowIndex} = this.state;

        console.log(expandable, 'expandable rows');
        // console.log(autoExpanded, 'auto', editable, 'edi', 'rows')

        let rowProps = {
            head,
            editable,
            expandable,
            autoExpanded,
            expandedRowIndex,
            updateRows: this.updateRows,
            updateRowsExpanded: this.updateRowsExpanded,
        }

        if (expandedRowIndex === -1 || autoExpanded){

            let paginator = <PaginatorTR key={'tab'}>
                <td colSpan={head.lenDisplayed()+1} style={{bottom: '0px'}}><PaginatorTD>
                    <Button onClick={() => this.turnPage(-1)}>前一页</Button>
                    <div>当前第{page+1}页，共{Math.ceil(data.length/ENTRIES_PER_PAGE)}页，{data.length}个条目</div>
                    <Button onClick={() => this.turnPage(1)}>后一页</Button>
                </PaginatorTD></td>
            </PaginatorTR>

            let sorter = [<td key={'indi'}></td>];
            for (let colKey in head) if (!head[colKey].hidden) if(head[colKey].isSortable) {
                sorter.push(<td key={colKey}><Ctrl>
                    <SortButton orderFunc={(isAscending) => this.updateRows('orderBy', [colKey, isAscending])} />
                    <Icon src={FilterIcon} onClick={(e) => alert('还没实现，再催催程序员。')}/>
                </Ctrl></td>)
            } else {
                sorter.push(<td key={colKey} />)
            }
            let sorterRow = <tr key={'sort'}>{sorter}</tr>

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
                return [sorterRow, elems];
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
                return [sorterRow, elems, paginator];
            }
            
        } else {
            return [<Row
                key={expandedRowIndex}
                rowIndex={expandedRowIndex}
                data={data[expandedRowIndex]}
                {...rowProps}
            />]
        }

    }
}