import React from 'react';
import styled from 'styled-components';

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
            data: props.data ? props.data : {path: [0, 0]}
        }
    }

    static getDerivedStateFromProps(props, state){

        if (props.data !== state.data){
            return {...state, data: props.data ? props.data : {path: [0, 0]}}
        }
        return state;
    }

    update = (e) => {

        e.preventDefault();
        e.stopPropagation();

        let val = e.target.value,
            path = e.target.dataset.path,
            newPath = `${path}->${val}`;
        let {colKey} = this.props;

        // this will call the parent method to change Record value
        let splittedNewPath = newPath.split('->');
        this.props.update('self', 'set', [colKey, splittedNewPath]);
        console.log(splittedNewPath, 'newPath');
        this.setState({
            data: splittedNewPath
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

        let {options, displayKey, isRowEditing} = this.props,
            {data} = this.state;

        if (isRowEditing){
            let selects = this.renderSelect([], data, options, displayKey);
            return <div style={{display: 'flex'}}>
                <Wrapper>{selects}</Wrapper>
            </div>
        } else {
            let [_, ...actualPath] = data;
            return <div style={{width: '100%'}}>
                {actualPath.map((e, i) => <String key={i}>{e}</String>)}
            </div>
        }
    }

}