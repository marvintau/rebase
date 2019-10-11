import React from 'react';
import styled from 'styled-components';

import CheckIcon from './icons/Check.png';

const Img = styled.img`
    margin: auto;
    width: 25px;
    height: 25px;
`

const Wrapper = styled.div`
    min-width: 100px;
    margin: 0px 5px;
    display: flex;
    flex-direction: column;

    & > div {
        margin: 2px 0px;
    }
`

const Select = styled.select`
    width: 100%;
    min-width: 50px;
    border: 1px solid black;
    outline: none;
`

const String = styled.div`
    font-weight: 300;
    line-height: 25px;
    font-family: 'Helvetica Neue', 'Pingfang SC', sans-serif;
`

function SingleSelect (props){

    let {data, options, displayKey, update, path} = props;

    let optionsElems = options.map((data, index)=>{
        return <option key={index}>{data.get(displayKey).valueOf()}</option>;
    })

    // 之所以要在这里使用data-path是因为，事件触发update方法的时候，
    // 我们可以直接从DOM中得到path。

    return <Wrapper>
        <Select
            data-path={path.join('->')}
            value={data}
            onFocus={update}
            onChange={update}
            >{optionsElems}
        </Select>
    </Wrapper>

}

export default class SelectPath extends React.Component {

    constructor(props, context){
        super(props, context);

        this.state={
            editing: false,
            data: props.data ? props.data : {path: [0, 0]}
        }
    }

    static getDerivedStateFromProps(props, state){

        if (props.data !== state.data){
            return {...state, data: props.data ? props.data : {path: [0, 0]}}
        }
        return state;
    }

    toggleEdit = (e) => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            editing: !this.state.editing
        })
    }

    update = (e) => {

        e.preventDefault();
        e.stopPropagation();

        let val = e.target.value,
            path = e.target.dataset.path,
            newPath = `${path}->${val}`;
        let {colKey} = this.props;

        // this will call the parent method to change Record value
        
        this.props.update('self', 'set', [colKey, newPath.split('->')]);

        this.setState({
            data: newPath.split('->')
        })
    }

    renderSelect(pastPath, nextPath, options, displayKey){

        let [curr, ...restPath] = nextPath;

        // if reached the end (leaf) of the tree, return nothing.
        if(options.length === 0){
            return [];
        }

        // for the case there is possibly leaves, but not yet selected.
        pastPath = pastPath.concat(curr); 
        let props = {
                key: `${pastPath.length}-${curr}`,
                data: curr,
                options,
                displayKey,
                path: pastPath,
                update: this.update
            };

        if(restPath.length === 0){
            return [<SingleSelect {...props} />];
        } else {
            let selected = restPath[0],
                selectedOption = options.find(e => e.get(displayKey).valueOf() === selected) || options[0],
                nextLevelOptions = selectedOption.heir;

            Object.assign(props, {data: selected})

            return [<SingleSelect {...props} />,
                ...this.renderSelect(pastPath, restPath, nextLevelOptions, displayKey)
            ]
        }
    }


    render(){
        let {options, displayKey, editable} = this.props,
            {data, editing} = this.state;

        if (editing){
            let selects = this.renderSelect([], data.path, options, displayKey);
            return <div style={{display: 'flex'}}>
                <Wrapper>{selects}</Wrapper>
                <Img key={'done'} src={CheckIcon} onClick={this.toggleEdit}/>
            </div>
        } else {
            let [_, ...actualPath] = data.path
            return <div style={{width: '100%'}} onDoubleClick={this.toggleEdit}>
                {actualPath.map((e, i) => <String key={i}>{e}</String>)}
            </div>
        }
    }

}