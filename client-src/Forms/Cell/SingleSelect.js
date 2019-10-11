import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    width: 100%;
`

const Select = styled.select`
    width: 100%;
    min-width: 50px;
    border: 1px solid black;
    outline: none;
`

export default class SingleSelect extends React.PureComponent{

    constructor(props){
        super(props);
        this.state = {data: props.data};
    }

    update = (e) => {
            
        let data = e.target.value;

        let {colKey, update} = this.props;

        // calling the method from parent to change Record value
        // Note that the parent method doesn't call setState, so
        // that there's no auto re-rendering.
        update('self', 'set', [colKey, data]);

        this.setState({
            data
        })
    }

    render(){
        let {options, displayKey, valueKey} = this.props,
            {data} = this.state;

        let optionsElems = options.map((data, index)=>{
            let value = data.get(valueKey),
                displayed = data.get(displayKey);

            return <option key={index} value={value}>{displayed}</option>;
        })

        return <Wrapper>
            <Select
                value={data}
                onFocus={this.update}
                onChange={this.update}
                >{optionsElems}
            </Select>
        </Wrapper>
    }

}