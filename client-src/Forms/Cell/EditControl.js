import React from 'react';
import styled from 'styled-components';

import ModifyRecordIcon from './icons/modify.png';
import CreateRecordIcon from './icons/create-record.png';
import DeleteRecordIcon from './icons/cross.png';
import SaveRecordIcon from './icons/Check.png';

const Control = styled.div`
    display: flex;
    jusify-content: flex-end;
`

const Icon = styled.img`
    width: 25px;
    height: 25px;
    margin: 0px 2px;
    cursor: pointer;
    opacity: ${({isHovered}) => isHovered ? '0.4' : '0'};

    &:hover {
        opacity: 1;
    }
`

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
        let {isRowEditing, isRowExpanded, isHovered, toggleEdit} = this.props;
        
        if (isRowEditing){
            return <Control>
                <Icon key={'save'} src={SaveRecordIcon} onClick={toggleEdit}/>
            </Control>
        }

        let move = [
            <Icon key={'create'} isHovered={isHovered} src={CreateRecordIcon} onClick={this.insert}/>,
            <Icon key={'remove'} isHovered={isHovered} src={DeleteRecordIcon} onClick={this.remove}/>,
            <Icon key={'modify'} isHovered={isHovered} src={ModifyRecordIcon} onClick={toggleEdit}/>
        ]
            
        return <Control>
            {move}
        </Control>
    }
}