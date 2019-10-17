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

    // 之所以要在这里使用data是因为，事件触发update方法的时候，
    // 我们可以直接从DOM中得到path。

    return <Wrapper>
        <Select
            data={path.join('->')}
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

        // NOTE:
        // 此处使用data[0]是一时权宜，因为在Head中使用了Array来初始化一个Path，
        // 但Path本身也是Array，所以就造成了Array of Array。未来重新设计persisted
        // head的时候，对这里要进行相应修改。

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