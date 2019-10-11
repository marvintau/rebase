import React from 'react';
import CellComponent from './CellComponent';

import styled from 'styled-components';

const TD = styled.td`
    padding: 6px 5px 4px;
    min-width: 25px;
    max-width: 100%;
    height: 25px;
    white-space: nowrap;
    ${({border=true}) => border ? 'border: 1px solid black;' : ''};
    user-select: none;
    ${({isControlCell=false, hovered=false}) => {
        if (isControlCell){
            return hovered ? 'display: hidden': '';
        } else {
            return hovered ? `background: #E3C08E;` : '';
        }
    }}
`

const Indenter = styled.div`
    height: 28px;
    width: ${({isExpandToggler, level}) => {
        return isExpandToggler ? `${5+level*8}px` : '5px'
    }};
`

const TDWrapper = styled.div`
    display: flex;
`

import RightArrowIcon from './icons/right-arrow.png';
import DownArrowIcon from './icons/down-arrow.png';

const Control = styled.div`
    width: 25px;
    height: 25px;
    cursor: pointer;
    opacity: 1;
`

const Img = styled.img`
    width: 25px;
    height: 25px;
    opacity: 1 !important;
`


export default function Cell(props){

    let expandControlElem,
        {isControlCell, expandable, isExpandToggler, isRowExpanded, toggleExpand} = props;

    if (isControlCell){

        let {EditControl} = CellComponent,
            {isRowExpanded, rowIndex, update} = props;

        return <TD border={false} isControlCell={true}>
            <EditControl
                isRowExpanded={isRowExpanded}
                rowIndex={rowIndex}
                update={update}
            />
        </TD>
    }

    if (isExpandToggler){
        if (expandable){
            let right = <Img src={RightArrowIcon} />,
                down  = <Img src={DownArrowIcon} />;
            expandControlElem = <Control onClick={toggleExpand}>
                {isRowExpanded ? down : right}
            </Control>
        } else {
            expandControlElem = <Control />
        }
    } else {
        expandControlElem = [];
    }

    let {hovered, style, disabled} = props,
        domStyle = {hovered, style};

    if(disabled){
        return <TD {...domStyle} />
    } else {

        let {level, type} = props,
            CellComp;

        switch(type.name){
            case 'PerPath':
                CellComp = CellComponent.SelectPath;
                break;
            case 'PerFloat':
            case 'PerInteger':
            case 'PerString':
            default:
                CellComp = CellComponent.Normal;
        }

        return <TD {...domStyle}>
            <TDWrapper>
                {expandControlElem}
                <Indenter isExpandToggler={isExpandToggler} level={level} />
                <CellComp {...props}/>
            </TDWrapper>
        </TD>
    }
}