import {Body} from 'persisted';

import React from 'react';

import Row from '../Row';
import PaginatorRow from './PaginatorRow';
import OrderRow from './OrderRow';

const ENTRIES_PER_PAGE = 15;

function filterData(list, filters){
    
    // 1. check if there is a rendom selector, omitting filters
    //    in other columns
    for (let k in filters) if (filters[k].startsWith('rand')){
        let rand = filters[k];
        let samples = parseInt(filters[k].replace(/\s/g, '').slice(4));
        if(isNaN(samples) || samples > list.length || samples < 1){
            return list;
        } else {
            let newList = [];
            while (newList.length < samples){
                let newSample = parseInt((Math.random()*samples));
                if(newList.indexOf(newSample) === -1) newList.push(newSample);
            }
            console.log(newList);
            return newList.map((i) => list[i]);
        }
    }

    let newList = [...list];
    for (let key in filters){
        newList = newList.filter(elem => {
            let filterFunc = `${elem.get(key)}${filters[key]}` 
            return eval(filterFunc);
        });
    }
    return newList;
}

export default class Rows extends React.PureComponent {
    constructor(props){
        super(props);

        this.state = {
            data : props.data,
            filters: {},
            page : 0,
            expandedRowIndex: -1
        }
    }

    static getDerivedStateFromProps(props, state){
        if(!state.fromInside){
            if (props.data !== state.data){
                return {
                    data: props.data,
                    filters: {},
                    page : 0,
                    fromInside : false
                }
            }
        } else {
            return {...state, fromInside: false}
        }
        return state;
    }
    
    updateRows = (operation, args) => {
        
        if (operation === 'insert') {
            args.push(this.props.head.createCols());
            console.log(args, 'insert argument')
        }

        let data = this.state.data[operation](...args);

        this.setState({data, fromInside: true})
    }

    orderRows = (colKey, isAscending) => this.updateRows('orderBy', [colKey, isAscending])

    addFilter = (colKey, filterText) => {
        let {filters} = this.state;

        // A very simple parser that checks the filter grammar.
        // only the two types below are permitted:
        // 1. a boolean expression that compares the current column and 
        //    a given number. (comparing operator and arbitrary real number)
        // 2. random selector, expression begins with "rand" and various integer.
        
        if (filterText.match(/^\s*(>=?|<=?|=)\s*[0-9]+(.[0-9]+)?\s*$/) !== null){
            filters = {...filters, [colKey]: filterText};
            this.setState({filters, fromInside: true})
        } else if(filterText.match(/^\s*rand\s*[0-9]+\s*$/)) {
            filters = {...filters, [colKey]: filterText};
            this.setState({filters, fromInside: true})
        } else{
            console.log('illegal filter expression, doing nothing');
        }

    }

    removeFilter = (colKey) => {
        let {filters} = this.state;
        let {[colKey]: omit, ...rest} = filters;
        console.log(rest);
        this.setState({filters: rest, fromInside: true})
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

        let nextPage = (direction > 0) ? Math.min(pages - 1, page + 1) : Math.max(0, page - 1);

        this.setState({
            page: nextPage,
            fromInside: true
        })
    }

    render(){
        let {head, autoExpanded, editable, expandable} = this.props;
        let {data, page, expandedRowIndex, filters} = this.state;

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

            let orderRow = <OrderRow
                key="order"
                head={head}
                orderFunc={this.orderRows}
                filters={filters}
                addFilter={this.addFilter}
                removeFilter={this.removeFilter}
            />

            let shownData;
            let paginator;
            if((data.length <= ENTRIES_PER_PAGE) || autoExpanded){
                shownData = data;
            } else if (Object.keys(filters).length > 0){
                shownData = filterData(data, filters);
                console.log(filters, shownData, 'filterd')
            } else {
                shownData = data.slice(page*ENTRIES_PER_PAGE, (page+1)*ENTRIES_PER_PAGE);
                console.log(filters, shownData, 'paged')

                paginator = <PaginatorRow
                    key="paginator"
                    colSpan={head.lenDisplayed()+1}
                    currPage={page}
                    totalPage={Math.ceil(data.length/ENTRIES_PER_PAGE)}
                    totalLength={data.length}
                    turnPrev={() => this.turnPage(-1)}
                    turnNext={() => this.turnPage(1)}
                />

            }

            let recordRows = shownData.map((entry, index) => {
                return <Row
                    key={index}
                    rowIndex={index+page*ENTRIES_PER_PAGE}
                    data={entry}
                    {...rowProps}
                />
            })

            return [orderRow, recordRows, paginator]
            
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