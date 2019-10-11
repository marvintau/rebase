import React from 'react';
import styled from 'styled-components';

import CreateRecordIcon from './icons/create-record.png';
import DeleteRecordIcon from './icons/cross.png';

const Control = styled.div`
    width: 0px;
    display: flex;
    jusify-content: flex-end;
`

const Icon = styled.img`
    width: 25px;
    height: 25px;
    margin: 0px 2px;
    cursor: pointer;
    opacity: 0.4;

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
        let {isRowExpanded} = this.props;

        let move = [
            <Icon key={'create'} src={CreateRecordIcon} onClick={this.insert}/>,
            <Icon key={'rem'} src={DeleteRecordIcon} onClick={this.remove}/>,
        ]

        if(isRowExpanded){
            return <Control/>
        } else {
            return <Control>
                {move}
            </Control>
        }
    }
}