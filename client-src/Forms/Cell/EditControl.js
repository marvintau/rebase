import React from 'react';

import ModifyRecordIcon from './icons/modify.png';
import CreateRecordIcon from './icons/create-record.png';
import DeleteRecordIcon from './icons/cross.png';
import SaveRecordIcon from './icons/check.png';

const controlStyle = {
    display: 'flex',
    jusifyContent: 'flex-end'
}

export default class EditControl extends React.Component{

    remove = () => {
        let {updateRows, rowIndex} = this.props;
        updateRows('remove', [rowIndex]);
    }

    insert = () => {
        let {updateRows, rowIndex} = this.props;
        updateRows('insert', [rowIndex]);
    }

    render(){
        let {isRowEditing, isHovered, toggleEdit} = this.props,
            {insertable, removable, modifiable} = this.props; 
        
        if (isRowEditing){
            return <div style={controlStyle}>
                <img className='icon' style={{opacity: '1'}} key={'save'} src={SaveRecordIcon} onClick={toggleEdit}/>
            </div>
        }

        let imgStyle = {};
        if (isHovered) {
            imgStyle = {opacity: 0.4}
        }

        let move = [];
        if(insertable){
            move.push(<img className='icon' style={imgStyle} key={'create'} src={CreateRecordIcon} onClick={this.insert}/>)
        }
        if(removable){
            move.push(<img className='icon' style={imgStyle} key={'remove'} src={DeleteRecordIcon} onClick={this.remove}/>)
        }
        if(modifiable){
            move.push(<img className='icon' style={imgStyle} key={'modify'} src={ModifyRecordIcon} onClick={toggleEdit}/>)
        }

        return <div style={controlStyle}>
            {move}
        </div>
    }
}