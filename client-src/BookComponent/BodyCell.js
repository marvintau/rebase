import React from 'react';
import styled from 'styled-components';

import CascadedSelect from './CascadedSelect';
import CodeSwitch from './CodeSwitch';

const TDMulti = styled.td`
    display: flex;

    border: 1px solid;
    white-space: pre;
    word-wrap: none;

    flex-direction: column;
    align-content: space-between;
`

const TD = styled.td`
    padding: 8px;
    border: 1px solid;
    white-space: pre;
    word-wrap: none;
`

const Select = styled.select`
    padding-bottom: 3px;
    margin: 0px 5px;
    width: 90%;
`


export default class BodyCell extends React.Component {
    
    render(){
        let {column, data, attr, path, update} = this.props;

        let displayData = data,
            style = {};
    
        if(attr && attr.type === 'Code'){
            return (<TD style={style}><CodeSwitch data={displayData} /></TD>)
        }

        if(attr && attr.type === 'MultiCode'){
            let display = data.map((code, index) => <CodeSwitch key={index} data={code} />)
            return (<TDMulti style={style}>{display}</TDMulti>)
        }

        if(!isNaN(data) && attr && attr.type==="Number"){
            
            if(data !== ""){
                displayData = parseFloat(data).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
            } else {
                displayData = data;
            }

            style.textAlign = 'right';
            style.fontFamily = 'Consolas';
            return (<TD style={style}>{displayData}</TD>);
        }
        if(!isNaN(data) && attr && attr.type==="int"){
            style.textAlign = 'right';
            style.fontFamily = 'Consolas';
            return (<TD style={style}>{data}</TD>);
        }
        if(attr && attr.type === "input"){
            return (<TD style={style}><input></input></TD>)
        }
        if(attr && attr.type === 'cascadedSelect'){

            return (<TD style={style}>
                <CascadedSelect
                    initialValue={data}
                    optionTree={attr.spec.optionTree} 
                    update={(newValue) => {
                        console.log(column, newValue, 'financial select');
                        this.props.update(column, newValue);
                    }} />                    
            </TD>)
        }

        if(attr && attr.type === 'select' && attr.spec === 'SumMethod'){

            return (<TD style={style}>
                <Select
                    value={data}
                    onChange={(e) => {
                        update(path, e.target.value);
                    }}
                    onClick={(e)=> {
                        e.preventDefault();
                    }}>
                    <option value="add">加入</option>
                    <option value="sub">减去</option>
                </Select>
            </TD>)
        }

        return <TD style={style}>{displayData}</TD>
    
    }

}