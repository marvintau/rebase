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

    ${({isSortable}) => isSortable ? `
        top: -1px;

        &:hover {
            background-color: #222222;
            cursor: pointer;
        }
    ` : ''}
`

class HeadCell extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            sorting: 'none'
        }
    }

    switchSort = (e) => {
        let {colKey, sortData} = this.props;
        let {sorting} = this.state;

        let newSort = sorting !== 'ascend' ? 'ascend' : 'descend';
        sortData(colKey, newSort);
        this.setState({
            sorting : newSort
        })
    }

    render(){
        let {isSortable, colDesc} = this.props;
        let {sorting} = this.state;
        console.log(sorting, 'sorting')
        return <TH isSortable={isSortable} onClick={this.switchSort}><div style={{display: 'flex', justifyContent:'center', alignItems:'center'}}>
            {colDesc}
            {(isSortable && sorting !== 'none') ? <Icon src={sorting !== 'ascend' ? SortAscend : SortDescend} /> : ''}
        </div></TH>
    }
}

const THControl = styled.th`
    position:sticky;
    top: -1px;
`


export default class Head extends React.Component{

    render(){
        let {head, tableAttr, sortData} = this.props;

        let headElem = [<Indicator key={'indicator'} />];

        for (let key in head){
            let {colDesc, hidden, isTitle, isSortable} = head[key];

            if(!(hidden || isTitle)){
                headElem.push(<HeadCell
                    key={key}
                    colKey={key}
                    isSortable={isSortable}
                    sortData={sortData}
                    colDesc={colDesc}
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