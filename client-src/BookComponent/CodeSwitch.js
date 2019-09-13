import React from 'react';
import styled from 'styled-components';

export default class CodeSwitch extends React.Component {

    constructor(props, context){
        super(props, context);
        this.state = {
            display: 'name'
        }
    }

    switchDisplay = () => {
        let display = {
            'name' : 'path',
            'path' : 'code',
            'code' : 'name'
        }[this.state.display];

        console.log('switching display', display)
        this.setState({display});
    }

    render(){
        console.log('codeswitch');
        
        let {data} = this.props;

        if ('code' in data){
            let display = data[this.state.display];
            return <div onClick={this.switchDisplay}>{display}</div>
        } else {
            return <div>{data}</div>
        }

    }
}