import React from 'react';
import styled from 'styled-components';

const Container = styled.table`
    border-collapse: collapse;
    table-layout: fixed;
    margin-bottom: 3px;
    width: 100%;
`

const TD = styled.td`
    border: 1px solid gray;
    margin: 5px;
    padding: 5px;
    vertical-align: center;
    text-align: center;
`

const TDControl = styled.td`
    border: 1px solid gray;
    margin: 5px;
    padding: 5px;
    vertical-align: center;
    text-align: center;
    width: 100px;

    &:hover {
        cursor: pointer;
        background: #DDDDDD;
    }

    &:active {
        font-weight: bold;
        background: #222222;
        color: #DDDDDD;
    }
`

const ButtonBox = styled.tr`
`

const Indicator = styled.div`
    display: flex;
    justify-content: space-evenly;
`

export default class GroupController extends React.Component {

    constructor(props, context){
        super(props, context);
    }

    render(){

        let {switchPage, levels, path, options, items} = this.props;

        let opts = Object.values(options);
        // console.log(opts, 'group options')
    
        let buttonLines = [];

        for (let [index, {desc, keys}] of opts.entries()){

            // console.log(desc, keys, path, index);

            let currIndex = keys.indexOf(path[index]),
                prevKey = keys[currIndex > 0 ? currIndex - 1 : 0],
                nextKey = keys[currIndex < keys.length - 1 ? currIndex + 1 : keys.length - 1];

            buttonLines.push(<ButtonBox key={index}>
                <TDControl onClick={(e) => {
                    e.stopPropagation();
                    switchPage(prevKey, index, levels)
                }}>{`前一${desc}`}</TDControl>
                <TD><Indicator>
                    <div>{`当前${desc}: ${path[index]}`}</div>
                    <div>{`${items ? items : keys.length}个条目`}</div>
                    <div>{`${currIndex+1}/${keys.length}`}</div>
                </Indicator></TD>
                <TDControl onClick={(e) => {
                    e.stopPropagation();
                    // e.preventDefault();
                    switchPage(nextKey, index, levels)
                }}>{`后一${desc}`}</TDControl>
            </ButtonBox>)
        }

        return <Container><thead>{buttonLines}</thead></Container>;

    }


}