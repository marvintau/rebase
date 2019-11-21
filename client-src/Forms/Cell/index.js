import React from 'react';
import CellComponent from './CellComponent';

const cellStyle = {
    padding: '0.5rem 0.4rem 0.4rem',
    // minWidth: '25px',
    // height: '25px',
    whiteSpace: 'nowrap',
    userSelect: 'none',
}

export default function Cell(props){

    let {isControlCell} = props;

    if (isControlCell){

        let {EditControl} = CellComponent,
            {isRowEditing, isHovered, rowIndex, updateRows, toggleEdit} = props,
            {insertable=true, removable=true, modifiable=true} = props;

        return <td style={{...cellStyle, width:'75px'}}>
            <EditControl
                isHovered={isHovered}
                isRowEditing={isRowEditing}
                rowIndex={rowIndex}
                updateRows={updateRows}
                toggleEdit={toggleEdit}
                insertable={insertable}
                removable={removable}
                modifiable={modifiable}
            />
        </td>
    } else {
        let {isHovered, colSpan, type} = props,
            CellComp;

        let style = {...cellStyle,
            borderTop: '0.25px solid black',
            borderBototm: '0.25px solid black',
            borderLeft: '0.25px dotted lightgray',
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