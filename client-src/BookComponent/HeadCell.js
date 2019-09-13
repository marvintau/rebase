import React from "react";
import styled from 'styled-components';

const TH = styled.th`
    position: sticky;
    position: -webkit-sticky;
    border: 1px solid black;
    top: -1px;
    z-index: 10;
`

export default function HeadCell({name}){
    return (<TH><div>{name}</div></TH>);
}
