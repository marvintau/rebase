import React from 'react';

import styled from 'styled-components';

const Digits = styled.div`
    text-align: right;
    font-size: 90%;
    font-weight: bold;
    letter-spacing: -0.01em;
    line-height: 25px;
    font-family: 'Consolas', 'Inconsolata', 'TheSansMono Office', 'Menlo', monospace;
    width: 100%;
`

const String = styled.div`
    line-height: 25px;
    font-family: 'Helvetica Neue', 'Pingfang SC', sans-serif;
    ${({isTitle}) => isTitle ? 'font-size: 100%; font-weight: 700;' : 'font-weight: 300;'}
`

const Edit = styled.input`
    width:auto;
    max-width: 75px;
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
        }
    }

    static getDerivedStateFromProps(props, state){
        if (props.data !== state.data){
            return {...state, data: props.data}
        }
        return state;
    }

    updateColumn = (e) => {
        let {colKey, update} = this.props;
        update('self', 'set', [colKey, e.target.value])
    }

    render(){
        let {type, isRowEditing, isTitle} = this.props,
            {data} = this.state;
    
        if (isRowEditing) {
            let value;
            switch(type.name){
                case 'Number':
                    let parsedNumber = parseFloat(data);
                    if (Number.isInteger(parsedNumber)){
                        value = parsedNumber.toFixed(0);
                    } else {
                        value = parsedNumber.toFixed(2);
                    }
                    break;
                case 'String':
                    console.log(value);
                    value = data;
                    value = value == "undefined" ? "" : value;
                    break;
                default:
                    value = data;
            }

            return [
                <Edit key={'edit'} defaultValue={value} onChange={this.updateColumn}/>,
            ]
        } else {
            switch(type.name){
                case 'Number':

                    let parsedNumber = parseFloat(data),
                        value = parsedNumber.toFixed(Number.isInteger(parsedNumber) ? 0 : 2);
    
                    return <Digits>{value}</Digits>;

                case 'String':
                    data = data == "undefined" ? "无" : data;
                default:
                    if (data === undefined){
                        console.log(this.props.colKey, 'undefined');
                        // data = new Number('123');
                    }
                    return <String isTitle={isTitle}>{data}</String>;
            }
        }

    }
}