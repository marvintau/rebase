import React from 'react';
import Normal from './Normal';

const rows = {
    display: 'flex',
    flexDirection: 'column',
}

const cols = {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
}

export default class MultiLine extends React.Component{

    constructor(props){
        super(props);

        let {data} = props;

        this.state = {
            collapsed: data ? data.lines.length > 1 : true
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

        if (data === undefined) {
            return <div />
        }

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

        return <div onDoubleClick={this.toggleCollapse} style={cols}>
            <div style={rows}>{lines}</div>
            {(data.lines.length > 1 && this.state.collapsed ? '...' : '')}
        </div>
    }
}