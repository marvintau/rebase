import React from 'react';
import CellComponent from './CellComponent';

import styled from 'styled-components';

const TD = styled.td`
    padding: 6px 5px 4px;
    min-width: 25px;
    max-width: 100%;
    height: 25px;
    white-space: nowrap;
    ${({border=true}) => border ? 'border-top: 1px solid black; border-bottom: 1px solid black;' : ''};
    user-select: none;
    ${({isHovered=false}) => {
        return isHovered ? `background: #E3C08E;` : '';
    }}
`

const Indenter = styled.div`
    height: 25px;
    width: ${({isExpandToggler, level}) => {
        return isExpandToggler ? `${5+level*8}px` : '5px'
    }};
`

const TDWrapper = styled.div`
    display: flex;
`

export default function Cell(props){

    let {isControlCell, isExpandToggler} = props;

    if (isControlCell){

        let {EditControl} = CellComponent,
            {isRowExpanded, isHovered, rowIndex, update} = props;

        return <TD border={false}>
            <EditControl
                isHovered={isHovered}
                isRowExpanded={isRowExpanded}
                rowIndex={rowIndex}
                update={update}
            />
        </TD>
    }

    let {isHovered, style, colSpan} = props,
        domStyle = {isHovered, style, colSpan};

    let {level, type} = props,
        CellComp;

    switch(type.name){
        case 'Path':
            CellComp = CellComponent.SelectPath;
            break;
        case 'MultiLine':
            CellComp = CellComponent.MultiLine;
            break;
        case 'Number':
        case 'String':
        default:
            CellComp = CellComponent.Normal;
    }

    return <TD {...domStyle}>
        <TDWrapper>
            <Indenter isExpandToggler={isExpandToggler} level={level} />
            <CellComp {...props}/>
        </TDWrapper>
    </TD>

}