import React from 'react';

export default class Rotatedisplay extends React.Component {

    constructor(props){
        super(props);

        let {columnAttr} = props,
            {rotateKeys} = columnAttr;

        let shiftKeys = [...rotateKeys, rotateKeys[0]];
        this.nextDict = {};
        for (i = 0; i < shiftKeys.length - 1; i++){
            let currKey = shiftKeys[i],
                nextKey = shiftKeys[i+1];
            this.nextDict[currKey] = nextKey;
        }

        this.state = {
            currKey: shiftKeys[0]
        }
    }

    rotateNext = () => {
        let {currKey} = this.state;
        this.setState({
            currKey: this.nextDict[currKey]
        })
    }

    render(props){
        let {data, recordAttr} = props;
        if(recordAttr.disabled){
            return <div />
        } else {
            let displayData = data[this.state.currKey];
            return <div>{displayData}</div>
        }
    }

}