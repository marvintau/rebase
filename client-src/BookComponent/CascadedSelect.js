import React from 'react';
import styled from 'styled-components';


const Select = styled.select`
    padding-bottom: 3px;
    margin: 0px 0px;
    width: 90%;
`

const Wrapper = styled.div`
    float: left;
`

export default class CascadedSelect extends React.Component {

    constructor(props, context){
        super(props, context);

        this.state={
            value: props.initialValue ? props.initialValue : "0-无"
        }
    }

    updateValue = (e) => {
        console.log('input update', this.state.value);
        let val = e.target.value,
            path = e.target.dataset.path;
        this.props.update(`${path}-${val}`);
        this.setState({
            value: `${path}-${val}`
        })
    }

    renderSelect(pastPath, [curr, ...restPath], optionTree){

        // if reached the end (leaf) of the tree, return nothing.
        if(optionTree === undefined || Object.keys(optionTree).length === 0){
            return [];
        }

        // otherwise, list all options on this level
        let options = [];
        for(let key in optionTree){
            options.push(<option key={key} value={key}>{key}</option>);
        }

        // for the case there is possibly leaves, but not yet selected.
        let currPath = pastPath.concat(curr);
        if(restPath.length === 0){
            return [<Wrapper key={curr}
                onClick={(e)=> {
                    e.preventDefault();
                    e.stopPropagation();
                }}><Select
                value={Object.keys(optionTree)[0]}
                data-path={currPath.join('-')}
                onFocus={(e) => this.updateValue(e)}
                onChange={(e) => this.updateValue(e)}
            >{options}</Select></Wrapper>];
        } else {
            let [selected, ...rest] = restPath;
            return [<Wrapper key={curr} onClick={(e)=> {
                    e.preventDefault();
                    e.stopPropagation();
                }}><Select
                
                data-path={currPath.join('-')}
                value={selected}
                onFocus={(e) => this.updateValue(e)}
                onChange={(e) => this.updateValue(e)}
            >{options}</Select></Wrapper>, ...this.renderSelect(currPath, restPath, optionTree[selected])]
        }
    }

    render(){

        let {optionTree} = this.props;

        return this.renderSelect([], this.state.value.split('-'), optionTree)
    }

}