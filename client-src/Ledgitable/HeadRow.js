import React from 'react';
import HeadCell from './HeadCell.js';

export default function HeadRow (props) {

    const {cols, isReadOnly, ...rest} = props;
    const colElems = [];
    if(!isReadOnly){
        colElems.push(<HeadCell data="编辑" className="edit-bar" key="edit" attr={({})}/>)
    }
    for (let colKey in cols){
        colElems.push(<HeadCell data={colKey} attr={cols[colKey]} key={colKey} {...rest}/>);
    }
    return (<tr>
        {colElems}</tr>);

}