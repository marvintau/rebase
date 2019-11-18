import React from 'react';

import ModifyRecordIcon from './icons/modify.png';
import CreateRecordIcon from './icons/create-record.png';
import DeleteRecordIcon from './icons/cross.png';
import SaveRecordIcon from './icons/check.png';

const controlStyle = {
    display: 'flex',
    jusifyContent: 'flex-end'
}

const iconStyle = {
    width: '25px',
    height: '25px',
    margin: '0px 2px',
    cursor: 'pointer',
    opacity: '0'
}

export default class EditControl extends React.Component{

    remove = () => {
        console.log('remove')
        let {update, rowIndex} = this.props;
        update('list', 'remove', [rowIndex]);
    }

    insert = () => {
        let {rowIndex, update} = this.props;
        update('list', 'insert', [rowIndex]);
    }

    render(){
        let {isRowEditing, isHovered, toggleEdit} = this.props;
        
        if (isRowEditing){
            return <div style={controlStyle}>
                <img style={{...iconStyle, opacity: '1'}} key={'save'} src={SaveRecordIcon} onClick={toggleEdit}/>
            </div>
        }

        let imgStyle = iconStyle;
        if (isHovered) {
            imgStyle = Object.assign({}, iconStyle, {opacity: '1'})
        }

        let move = [
            <img style={imgStyle} key={'create'} src={CreateRecordIcon} onClick={this.insert}/>,
            <img style={imgStyle} key={'remove'} src={DeleteRecordIcon} onClick={this.remove}/>,
            <img style={imgStyle} key={'modify'} src={ModifyRecordIcon} onClick={toggleEdit}/>
        ]
            
        return <div style={controlStyle}>
            {move}
        </div>
    }
}