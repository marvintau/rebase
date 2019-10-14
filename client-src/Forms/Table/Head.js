import React from 'react';
import styled from 'styled-components';

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
    vertical-align: middle;
    text-align: center;
    line-height: 1.5em;
    border-bottom: 1px solid black;
    background-color: #555555;
    color: #FEFEFE;
    font-family: 'Pingfang SC', 'Microsoft Yahei';
    font-weight: bold;
    position:sticky;
    top: -1px;
`

const THControl = styled.th`
    background-color: #FAFCFE;
    position:sticky;
    top: -1px;
`


export default class Head extends React.Component{

    render(){
        let {head, tableAttr} = this.props;

        let headElem = [<Indicator key={'indicator'} />];

        for (let key in head){
            let {colDesc, hidden, isTitle} = head[key];

            if(!(hidden || isTitle)){
                headElem.push(<TH key={key}>{colDesc}</TH>)
            }
        }

        // 如果表格是左侧存在工具栏，那么需要新增一个空表头单元格。
        if (tableAttr.controllable) {
            headElem.push(<THControl key={'ctrl'}/>)
        }

        return <tr>{headElem}</tr>
    }

}