import React from 'react';

const indicator = {
    width: '25px',
    height: '25px',
    minWidth: '25px',
    maxWidth: '25px',
    background: '#555555',
    position: 'sticky',
    top: '-1px',
}

const headCell = {
    // padding: "6px 5px 4px",
    // minWidth: "25px",
    // height: "28px",
    textAlign: "center",
    background: "#555555",
    color: "#FEFEFE",
    fontFamily: "'Pingfang SC', 'Microsoft Yahei'",
    fontWeight: "bold",
    position: "sticky",
    top: "-1px",
    userSelect: "none",
    // cursor: "pointer",
}


const control = {
    position: 'sticky',
    top: '-1px',
}


export default class Head extends React.Component{

    constructor(props){
        super(props);
    }

    render(){
        let {head, editable} = this.props;

        let headElem = [<th style={indicator} key={'indicator'} />];

        for (let key in head){
            let {colDesc, hidden, isTitle} = head[key];

            if(!(hidden || isTitle)){
                headElem.push(<th style={headCell} key={key}>{colDesc}</th>)
            }
        }

        // 如果表格是左侧存在工具栏，那么需要新增一个空表头单元格。
        if (editable) {
            headElem.push(<th style={control} key={'ctrl'}/>)
        }

        return <tr>{headElem}</tr>
    }

}