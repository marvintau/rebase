import React from 'react';

import styled from 'styled-components';

import CheckIcon from './icons/Check.png';

const Img = styled.img`
    margin: auto;
    width: 25px;
    height: 25px;
`

const Number = styled.div`
    text-align: right;
    font-size: 90%;
    font-weight: bold;
    letter-spacing: -0.01em;
    line-height: 25px;
    font-family: 'Consolas', 'Inconsolata', 'TheSansMono Office', 'Menlo', monospace;
    width: 100%;
`

const String = styled.div`
    font-weight: 300;
    line-height: 25px;
    font-family: 'Helvetica Neue', 'Pingfang SC', sans-serif;
`

const Edit = styled.input`
    width:100%;
    margin:0px 5px;
    padding: 0px 5px;
    text-align: right;
    height: 25px;
    font-size: 80%;
    font-weight: bold;
    font-family: 'Consolas', 'Inconsolata', 'TheSansMono Office', 'Menlo', monospace;
    outline: none;
    border: 1px solid black;
    border-radius: 5px;
`

export default class Normal extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            data: props.data,
            isEditing: false
        }
    }

    static getDerivedStateFromProps(props, state){
        if (props.data !== state.data){
            return {...state, data: props.data}
        }
        return state;
    }

    toggleEdit = (e) => {
        this.setState({
            isEditing: !this.state.isEditing
        })
    }

    updateColumn = (e) => {
        let {colKey, update} = this.props;
        update('self', 'set', [colKey, e.target.value])
    }

    render(){
        let {type, editable} = this.props,
            {data, isEditing} = this.state;
    

        if (isEditing) {
            let value;
            switch(type.name){
                case 'PerFloat':
                    value = parseFloat(data).toFixed(2);
                case 'PerInteger':
                    value = parseInt(data);
                case 'PerString':
                default:
                    value = data.valueOf();
            }

            return [
                <Edit key={'edit'} defaultValue={value} onChange={this.updateColumn}/>,
                <Img key={'done'} src={CheckIcon} onClick={this.toggleEdit}/>
            ]
        } else {
            switch(type.name){
                case 'PerFloat':
                    return <Number onDoubleClick={editable ? this.toggleEdit: undefined}>{
                        parseFloat(data).toFixed(2)}
                    </Number>;
                case 'PerInteger':
                    return <Number onDoubleClick={editable ? this.toggleEdit: undefined}>
                        {parseInt(data)}
                    </Number>;
                case 'PerString':
                default:
                    return <String onDoubleClick={editable ? this.toggleEdit: undefined}>
                        {data.valueOf()}
                    </String>;
            }
        }

    }
}