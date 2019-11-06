import React from 'react';
import CellComponent from './CellComponent';

import styled from 'styled-components';

const TD = styled.td`
    ${({isControlCell})=> isControlCell ? 'width : 75px;' : 'border-right: 1px dotted gray;' }
    padding: 6px 5px 4px;
    min-width: 25px;
    height: 25px;
    white-space: nowrap;
    ${({border=true}) => border ? 'border-top: 1px solid black; border-bottom: 1px solid black;' : ''};
    user-select: none;
    ${({isHovered=false}) => {
        return isHovered ? `background: #E3C08E;` : '';
    }}
`

const TDWrapper = styled.div`
    display: flex;
`

export default function Cell(props){

    let {isControlCell} = props;

    if (isControlCell){

        let {EditControl} = CellComponent,
            {isRowEditing, isHovered, rowIndex, update, toggleEdit} = props;

        return <TD isControlCell={isControlCell} border={false}>
            <EditControl
                isHovered={isHovered}
                isRowEditing={isRowEditing}
                rowIndex={rowIndex}
                update={update}
                toggleEdit={toggleEdit}
            />
        </TD>
    }

    let {isHovered, colSpan} = props,
        domStyle = {isHovered, colSpan};

    let {type} = props,
        CellComp;

    switch(type.name){
        case 'Path':
            CellComp = CellComponent.SelectPath;
            break;
        case 'RefString':
            CellComp = CellComponent.RefString;
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
            <CellComp {...props}/>
        </TDWrapper>
    </TD>

}