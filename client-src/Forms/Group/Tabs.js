import React from 'react';

import Rows from '../Table/Rows';
import Head from '../Table/Head';

import {Table} from 'persisted';

const cellStyle = {
    padding: 0,
    minWidth: '25px',
    height: '25px',
    whiteSpace: 'nowrap',
    userSelect: 'none',
}

const tabRowStyle = {
    height: '28px',
    padding: '0',
    width: "100%",
    borderTop: '1px solid black',
    fontFamily: "'Optima'",
    fontWeight: "300",
}

const tabCellStyle = {
    display: 'flex',
    justifyContent: 'space-between',
}

const tabElemStyle = {
    textAlign: 'center',
    padding: '10px',
    userSelect: 'none',
    cursor: 'pointer',
}

export default class Tabs extends React.Component {

    constructor(props){
        super(props);

        let {table} = props,
            currKey = table.data.keys ? table.data.keys()[0] : undefined;

        this.state = {
            data: table.data,
            currKey
        }
    }

    evaluate = () => {
        let {table} = this.props;
        if(table.constructor.name === 'WorkTable'){
            console.log('evaluated, ateleast')
            
            this.setState({
                data: table.evaluate()
            })
        }
    }

    setCurrKey = (currKey) => {
        console.log(currKey, 'setCurrKey')
        this.setState({
            currKey,
        })
    }

    prevKey = () => {
        let {table} = this.props,
            keys = table.data.keys(),
            {currKey} = this.state,
            currKeyIndex = keys.indexOf(currKey),
            prevKey = keys[currKeyIndex === 0 ? 0 : currKeyIndex - 1];

        this.setState({
            currKey: prevKey,
        })
    }

    nextKey = () => {
        let {table} = this.props,
            keys = table.data.keys(),
            {currKey} = this.state,
            currKeyIndex = keys.indexOf(currKey),
            nextKey = keys[currKeyIndex === keys.length - 1 ? keys.length - 1 : currKeyIndex + 1];
        this.setState({
            currKey: nextKey,
        })
    }

    render(){

        let {table} = this.props,
            {head, attr} = table,
            {editable, expandable, autoExpanded} = attr,
            {data} = this.state;

        if (data.constructor.name === 'Body'){

            let props = { head, data, ...attr}

            return [
                <Head {...props} key={'head'}/>,
                <Rows key={'table'}
                    head={head}
                    data={data}
                    editable={editable}
                    expandable={expandable}
                    autoExpanded={autoExpanded}
                    evaluate={this.evaluate}
                />
            ]
        } else if( data.constructor.name === 'Tabs') {

            // 如果列表左侧有工具按钮，那么tab的宽度也需要对应增加1
            
            let tabStyle = data.tabStyle ? data.tabStyle : 'paginator';
    
            let controller;
            if(tabStyle === 'paginator'){
                
                controller = <td style={cellStyle} colSpan={head.lenDisplayed()+1}>
                    <div style={tabCellStyle}>
                        <div style={tabElemStyle}  onClick={() => this.prevKey()}>前一{data.desc}</div>
                        <div style={tabElemStyle} >当前第{this.state.currKey}{data.desc}</div>
                        <div style={tabElemStyle}  onClick={() => this.nextKey()}>后一{data.desc}</div>
                    </div>
                </td>

            } else if (tabStyle === 'tabs') {
    
                let keys = data.keys().map((e, i) => {
                    let displayed = e === this.state.currKey ? <b>{e}</b> : e;
                    return <div key={i} onClick={() => this.setCurrKey(e)}>{displayed}</div>
                })
    
                controller = <td style={{...cellStyle, width: '100%'}} colSpan={head.lenDisplayed()+1}>
                    <div style={tabCellStyle}>
                        <div style={tabElemStyle} onClick={() => this.prevKey()}>前一{data.desc}</div>
                        {keys}
                        <div style={tabElemStyle} onClick={() => this.nextKey()}>后一{data.desc}</div>
                    </div>
                </td> 
            }

            let content = data.get(this.state.currKey);
            
            let subLevel;
            if (content.constructor.name === 'Body'){
                subLevel = [
                    <Head key={'head'}
                        head={head}
                        data={content}
                        attr={attr}
                    />,
                    <Rows key={'table'}
                        head={head}
                        data={content}
                        editable={editable}
                        expandable={expandable}
                        autoExpanded={autoExpanded}
                    />
                ]
            } else if (content.constructor.name === 'Tabs'){
                subLevel = <Tabs key={`group-${this.state.currKey}-${content.desc}`}
                    table= {new Table(head, content, attr)}
                />
            }
    
            return [<tr style={tabRowStyle} key={`tab-${data.desc}`}>{controller}</tr>, subLevel]
        }
    }

}