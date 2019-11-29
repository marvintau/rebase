import React from 'react';

import FilterIcon from './icons/filter.png';
import SortIcon from './icons/sort-ascending.png';
import FilterRow from './FilterRow';

const cellStyle = {
    padding: '0.5rem 0.4rem 0.4rem',
    whiteSpace: 'nowrap',
    userSelect: 'none',
}

const iconStyle = {
    width:  '30px',
    height: '30px',
    padding: '3px',
    cursor: 'pointer',
}

const iconBackStyle ={
    display: 'flex',
    justifyContent: 'space-around'
}

class FilterButton extends React.Component {
    render(){
        let {colKey, switchFilterEditedCol} = this.props;
        return <img style={iconStyle} src={FilterIcon} onClick={(e) => switchFilterEditedCol(colKey)}/>
    }
}

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
        let {colKey, orderFunc} = this.props;
        return <img style={iconStyle} src={SortIcon} onClick={(e) => {
            orderFunc(colKey, this.state.isAscending);
            this.toggleOrder();
        }}/>
    }
}

export default class OrderRow extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            filterEditedCol: undefined
        }
    }

    switchFilterEditedCol = (colKey) => {
        let {filterEditedCol} = this.state;
        this.setState({
            filterEditedCol: filterEditedCol === colKey ? undefined : colKey
        })
    }

    render() {

        let {head, filters, orderFunc, addFilter, removeFilter} = this.props;
        let {filterEditedCol} = this.state;

        let cols = [<td style={cellStyle} key={'indi'}></td>];
        for (let colKey in head) if (!head[colKey].hidden) if(head[colKey].isSortable) {

            let td = <td key={colKey} style={cellStyle}><div style={iconBackStyle}>
                <SortButton colKey={colKey} orderFunc={orderFunc} />
                <FilterButton colKey={colKey} switchFilterEditedCol={this.switchFilterEditedCol} />
            </div></td>

            cols.push(td)
        } else {
            cols.push(<td key={colKey} />)
        }

        let rows = [<tr key={'sort'}>{cols}</tr>]

        if(filterEditedCol){
            let filterEditingRow = <FilterRow
                key={filterEditedCol}
                colKey={filterEditedCol}
                colDesc={head[filterEditedCol].colDesc}
                filterText={filters[filterEditedCol]}
                colSpan={head.lenDisplayed()+1}
                addFilter={addFilter}
                removeFilter={removeFilter}
            />
            rows.push(filterEditingRow)
        }

        return rows;
    }
}