import React from 'react';

const inputStyle = {
    height: '25px',
    width: '80%',
    padding:'2px',
    margin:'5px',
    fontSize: '15px',
    fontFamily:"Colsolas, 'TheSansMono Office', monospace",
    border: '1px solid black',
    borderRadius:'3px',
    outline:'none'
}

const wrapperStyle = {
    borderTop: '1px solid black',
    display:'flex',
    justifyContent: 'space-around',
}

const buttonStyle = {
    width: '100px',
    border: '1px solid black',
    borderRadius:'3px',
    margin:'5px',
    outline: 'none',
    cursor: 'pointer'
}

const labelStyle= {
    width: '100px',
    height: '25px',
    padding: '3px',
    margin: '5px',
    lineHeight: '25px',
    // display: 'table-cell',
    // verticalAlign: 'middle',
    textAlign:'center',
}

/**
 * FilterRow
 * ---------
 * 用于显示Filter文本的组件
 * 
 * 
 */

export default class FilterRow extends React.Component {

    constructor(props){
        super(props)
        this.filterInputDOM = React.createRef();
    }

    getText = () => {
        return this.filterInputDOM.current.value;
    }

    render(){
        let {colKey, colDesc, filterText, addFilter, removeFilter, colSpan} = this.props;

        console.log(filterText, 'row');
        filterText = filterText === undefined ? 'true' : filterText;



        return <tr><td colSpan={colSpan}><div style={wrapperStyle}>
            <div style={labelStyle}>{colDesc}</div>
            <input style={inputStyle} ref={this.filterInputDOM} defaultValue={filterText} />
            <button style={buttonStyle} onClick={(e) => addFilter(colKey, this.getText())}>应用过滤器</button>
            <button style={buttonStyle} onClick={(e) => removeFilter(colKey)}>移除过滤器</button>
        </div></td></tr>
    }
}
