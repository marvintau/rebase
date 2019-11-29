import React from 'react';

const TRStyle = {
    width: '100%',
    fontFamily: 'Optima',
    fontWeight: '300'
}

const TDStyle = {
    borderTop: '1px solid black !important',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
}

const Button = {
    margin: '5px',
    userSelect: 'none',
    cursor: 'pointer'
}

export default class PaginatorRow extends React.Component {

    render(){

        let {colSpan, turnPrev, turnNext, currPage, totalPage, totalLength} = this.props;

        return <tr style={TRStyle} key={'tab'}>
            <td colSpan={colSpan} style={{bottom: '0px'}}><div style={TDStyle}>
                <div style={Button} onClick={turnPrev}>前一页</div>
                <div>当前第{currPage+1}页，共{totalPage}页，{totalLength}个条目</div>
                <div style={Button} onClick={turnNext}>后一页</div>
            </div></td>
        </tr>
    }
}