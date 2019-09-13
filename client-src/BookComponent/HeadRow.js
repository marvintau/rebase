import React from 'react';
import HeadCell from './HeadCell.js';

export default function HeadRow ({cols}) {

    let colElems = cols.map(({name, colKey}, index) => {
        return <HeadCell key={colKey+index} name={name} />
    });

    return (<tr>{colElems}</tr>);

}