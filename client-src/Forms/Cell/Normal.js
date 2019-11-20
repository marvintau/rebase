import React from 'react';

import styled from 'styled-components';

const Digits = styled.div`
    text-align: right;
    font-weight: bold;
    letter-spacing: -0.01em;
    line-height: 25px;
    font-family: 'Arial Narrow', 'Avenir Next Condensed', monospace;
    width: 100%;
`

const String = styled.div`
    line-height: 25px;
    word-wrap: break-word;
    font-family: 'Helvetica Neue', 'Pingfang SC', 'Microsoft Yahei', sans-serif;
    ${({isTitle}) => isTitle ? 'font-size: 100%; font-weight: 700;' : 'font-size: 110%; font-weight: 400;'}
`

const Error =styled.div`
    color: rgb(224, 0, 0);
    text-align: right;
    line-height: 25px;
    font-weight: bold;
    width: 100%;
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
    font-family: 'Arial Narrow', monospace;
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

    render(){
        let {isTitle} = this.props,
            {data} = this.state;
    
        let type = data !== undefined ? data.constructor : String;

        switch(type.name){

            case 'Number':

                let parsedNumber = parseFloat(data),
                    value = parsedNumber.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})

                return <Digits>{value}</Digits>;

            case 'String':
                
                data = data == "undefined" ? "无" : data;

            default:
                if (data === undefined){
                    data = '';
                }
                
                return <String isTitle={isTitle}>{data}</String>;
        }


    }
}