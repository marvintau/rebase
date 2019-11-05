import React from 'react';
import styled from 'styled-components';

import Rows from '../Table/Rows';
import Head from '../Table/Head';

const TabTR = styled.tr`
    width: 100%;
    font-family: 'Optima';
    font-weight: 300;
`

const TabTD = styled.div`
    border-top: 1px solid black !important;

    display: flex;
    justify-content: space-between;

    & div {
        text-align: center;
        padding: 10px;
    }
`

const Button = styled.div`

    user-select: none;

    &:hover {
        background-color: #DEF9F3;
        cursor: pointer;
    }
`

export default class Tabs extends React.Component {

    constructor(props){
        super(props);

        let currKey = props.data.keys ? props.data.keys()[0] : undefined;

        this.state = {
            data: this.props.data,
            currKey
        }
    }

    setCurrKey = (currKey) => {
        console.log(currKey, 'setCurrKey')
        this.setState({
            currKey,
        })
    }

    prevKey = () => {
        let keys = this.props.data.keys(),
            {currKey} = this.state,
            currKeyIndex = keys.indexOf(currKey),
            prevKey = keys[currKeyIndex === 0 ? 0 : currKeyIndex - 1];

        this.setState({
            currKey: prevKey,
        })
    }

    nextKey = () => {
        let keys = this.props.data.keys(),
            {currKey} = this.state,
            currKeyIndex = keys.indexOf(currKey),
            nextKey = keys[currKeyIndex === keys.length - 1 ? keys.length - 1 : currKeyIndex + 1];
        this.setState({
            currKey: nextKey,
        })
    }

    render(){

        let {head, attr} = this.props,
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
                />
            ]
        } else if(data.constructor.name === 'Tabs') {

            // 如果列表左侧有工具按钮，那么tab的宽度也需要对应增加1
            
            let tabStyle = data.tabStyle ? data.tabStyle : 'paginator';
    
            let controller;
            if(tabStyle === 'paginator'){
                
                controller = <td colSpan={head.lenDisplayed()+1}><TabTD>
                    <Button onClick={() => this.prevKey()}>前一{data.desc}</Button>
                    <div>当前第{this.state.currKey}{data.desc}</div>
                    <Button onClick={() => this.nextKey()}>后一{data.desc}</Button>
                </TabTD></td>

            } else if (tabStyle === 'tabs') {
    
                let keys = data.keys().map((e, i) => {
                    let displayed = e === this.state.currKey ? <b>{e}</b> : e;
                    return <Button key={i} onClick={() => this.setCurrKey(e)}>{displayed}</Button>
                })
    
                controller = <td style={{width: '100%'}} colSpan={head.lenDisplayed()+1}><TabTD>
                    <Button onClick={() => this.prevKey()}>前一{data.desc}</Button>
                    {keys}
                    <Button onClick={() => this.nextKey()}>后一{data.desc}</Button>
                </TabTD></td> 
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
                    head={head}
                    data={content}
                    attr={attr}
                />
            }
    
            return [<TabTR key={`tab-${data.desc}`}>{controller}</TabTR>, subLevel]
            // return [<TabTR key={`tab-${data.desc}`}>{controller}</TabTR>]
        }
    }

}