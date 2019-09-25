import React from 'react';
import styled from 'styled-components';

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


export default function InsertRemoveCell (props) {

    let {style} = props;

    return (<TD style={style}>
        hahaha
    </TD>)

}