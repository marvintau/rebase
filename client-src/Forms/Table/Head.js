import React from 'react';
import styled from 'styled-components';

import SortAscend from './icons/sort-ascending.png';
import SortDescend from './icons/sort-descending.png';

const Icon = styled.img`
    margin-left: 2px;
    width: 25px;
    height: 25px;
`

const Indicator = styled.td`
    border-bottom: 1px solid black;
    width: 25px;
    min-width: 25px;
    max-width: 25px;
    background-color: #555555;
    position:sticky;
    top: -1px;
`

const TH = styled.th`
    padding: 6px 5px 4px;
    min-width: 25px;
    height: 28px;
    text-align: center;
    // line-height: 1.5em;
    border-bottom: 1px solid black;
    background-color: #555555;
    color: #FEFEFE;
    font-family: 'Pingfang SC', 'Microsoft Yahei';
    font-weight: bold;
    position:sticky;
    user-select: none;

    &:hover {
        background-color: #222222;
        cursor: pointer;
    }
`

class HeadCell extends React.Component{

    constructor(props){
        super(props);
    }

    render(){
        let {colKey, colDesc, isSortedKey, sortOrder, switchSort} = this.props;

        return <TH onClick={(e) => switchSort(colKey)}>
            <div style={{display: 'flex', justifyContent:'center', alignItems:'center'}}>
                {colDesc}
                {(isSortedKey && sortOrder !== 'none') ? <Icon src={sortOrder === 'ascend' ? SortAscend : SortDescend} /> : ''}
            </div>
        </TH>
    }
}

const THControl = styled.th`
    position:sticky;
    top: -1px;
`


export default class Head extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            sortKey : undefined,
            sortOrder : 'none'
        }
    }

    switchSort = (colKey) => {
        let {sortData} = this.props,
            {sortOrder} = this.state;

        let nextSortOrder = sortOrder !== 'ascend' ? 'ascend' : 'descend';
        sortData(colKey, nextSortOrder);

        this.setState({
            sortKey : colKey,
            sortOrder : nextSortOrder
        })
    }

    render(){
        let {head, tableAttr, sortData} = this.props,
            {sortKey, sortOrder} = this.state;

        let headElem = [<Indicator key={'indicator'} />];

        for (let key in head){
            let {colDesc, hidden, isTitle} = head[key];

            if(!(hidden || isTitle)){
                headElem.push(<HeadCell
                    key={key}
                    colKey={key}
                    colDesc={colDesc}

                    isSortedKey={key === sortKey}
                    sortOrder={sortOrder}

                    sortData={sortData}
                    switchSort={this.switchSort}
                />)
            }
        }

        // 如果表格是左侧存在工具栏，那么需要新增一个空表头单元格。
        if (tableAttr.editable) {
            headElem.push(<THControl key={'ctrl'}/>)
        }

        return <tr>{headElem}</tr>
    }

}