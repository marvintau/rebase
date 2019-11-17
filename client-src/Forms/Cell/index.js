import React from 'react';
import CellComponent from './CellComponent';

const cellStyle = {
    padding: '6px 5px 4px',
    minWidth: '25px',
    height: '25px',
    whiteSpace: 'nowrap',
    userSelect: 'none',
}

export default function Cell(props){

    let {isControlCell} = props;

    if (isControlCell){

        let {EditControl} = CellComponent,
            {isRowEditing, isHovered, rowIndex, update, toggleEdit} = props;

        return <td style={{...cellStyle, width:'75px'}}>
            <EditControl
                isHovered={isHovered}
                isRowEditing={isRowEditing}
                rowIndex={rowIndex}
                update={update}
                toggleEdit={toggleEdit}
            />
        </td>
    } else {
        let {isHovered, colSpan, type} = props,
            CellComp;

        let style = {...cellStyle,
            borderTop: '1px solid black',
            borderBototm: '1px solid black',
        }

        if (isHovered){
            style.background = '#E3C08E';
        }

        switch(type.name){
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

        return <td colSpan={colSpan} style={style}>
            <CellComp {...props}/>
        </td>

    }
}