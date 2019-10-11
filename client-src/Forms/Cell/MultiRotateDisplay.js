import React from 'react';
import RotateDisplay from './RotateDisplay';

export default function MultiRotateDisplay(props){

    let {columnAttr} = props;

    let {data} = props;

    return data.map((datum, index) => {
        return <RotateDisplay key={index} columnAttr={columnAttr} data={datum} />
    })
}