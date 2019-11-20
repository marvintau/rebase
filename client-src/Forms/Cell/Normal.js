import React from 'react';

const digitStyle = {
    textAlign: "right",
    fontWeight: "bold",
    letterSpacing: "0.01em",
    lineHeight: "25px",
    fontFamily: "'Arial Narrow', 'Avenir Next Condensed', monospace",
    width: "100%",
}

const stringStyle = {
    lineHeight: "25px",
    wordWrap: "breakWord",
    fontFamily: "'Helvetica Neue', 'Pingfang SC', 'Microsoft Yahei', sansSerif",
}

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

                return <div style={digitStyle}>{value}</div>;

            case 'String':
                
                data = data == "undefined" ? "无" : data;

            default:
                if (data === undefined){
                    data = '';
                }
                
                return <div style={stringStyle} isTitle={isTitle}>{data}</div>;
        }


    }
}