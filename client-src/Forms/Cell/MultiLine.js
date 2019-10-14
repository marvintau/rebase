import React from 'react';
import Normal from './Normal';
import styled from 'styled-components';

const FlexRows = styled.div`
    display: flex;
    flex-direction: column;
`

const FlexCols = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
`

export default class MultiLine extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            collapsed: props.data.lines.length > 1
        }
    }

    toggleCollapse = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            collapsed: !this.state.collapsed
        })
    }

    render(){
        let {type, data} = this.props;

        // console.log(data, 'multiline');

        let lines = data.lines.map((datum, index) => {

            let elemProps = {
                type,
                data: datum,
                editable: false
            }

            return <Normal key={index} {...elemProps}/>
        })

        if (this.state.collapsed){
            lines = lines[0];
        }

        return <FlexCols onDoubleClick={this.toggleCollapse}>
            <FlexRows>{lines}</FlexRows>
            {(data.lines.length > 1 && this.state.collapsed ? '...' : '')}
        </FlexCols>
    }
}