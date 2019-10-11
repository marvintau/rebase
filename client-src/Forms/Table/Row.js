import React from 'react';
import styled from 'styled-components';

import Cell from '../Cell/Cell';
import Rows from './Rows';
import Formwell from '../Formwell';

const TR = styled.tr`
`

const TDTab = styled.td`
    margin: 10px;
    padding: 10px;
    z-index: -1;
`

export default class Row extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            data: this.props.data,
            hovered: false,
            isRowExpanded: false,
        };
    }

    static getDerivedStateFromProps(props, state){
        if (props.data !== state.data){
            return {...state, data: props.data}
        }
        return state;
    }

    updateRow = (type, method, args) => {

        if (type === 'list') {
            this.props.updateRows(method, args);
        } else if (type === 'self'){
            let {data} = this.state;
            this.setState({
                data: data[method](...args)
            })
        }
    }

    toggleExpand = () => {
        let {updateRowsExpanded, rowIndex} = this.props;
        updateRowsExpanded(rowIndex);

        this.setState({
            isRowExpanded : !this.state.isRowExpanded
        })
    }

    onMouseEnter = ()=>{
        this.setState({hovered: true});
    }

    onMouseLeave = ()=>{
        this.setState({hovered: false});
    }

    render(){

        let {rowIndex, level, head, tableAttr={}, rowsExpanded} = this.props;
        
        let {data, hovered, isRowExpanded} = this.state,
            {expandable, controllable} = tableAttr;

        expandable = expandable && (data.hasChild() || data.hasTable());

        let sharedCellProps = {
            level,
            update: this.updateRow,
            toggleExpand: this.toggleExpand,
            ...tableAttr, 
            expandable
        }

        let cols = [],
            titleData,
            titleColKey,
            colsWidth = head.len();

        // 检查这个column是否是否是title
        for (let key in head) if (head[key].isTitle){
            titleColKey = key;
            titleData = data.get(key);
        }

        // 如果是title，那么cols将只包含一个cell，同时占满整个表格行。需要注意的是，
        // 如果head中包含的title字段，在data中并不包含，或者data中包含的内容（即
        // 字符串）是空的，那么都不会作为title来处理。
        if (titleColKey && titleData && titleData.length > 0){

            let cellProps = {
                ...sharedCellProps,
                ...head[titleColKey],
                hovered, isRowExpanded, rowsExpanded,
                colKey: titleColKey,
                data: data.get(titleColKey),
                colSpan: colsWidth,
                toggleExpand
            }

            cols.push(<Cell key={'title'} {...cellProps}/>)

        } else {

            for (let colKey in head){

                let cellProps = {
                    ...sharedCellProps,
                    ...head[colKey],
                    hovered, isRowExpanded, rowsExpanded,
                    colKey: colKey,
                    colSpan: colsWidth,
                    data: data.get(colKey),
                }
    
                cols.push(<Cell key={colKey}{...cellProps}/>)
            }

            if (controllable){
                cols.push(<Cell
                    key={'ctrl'}
                    isControlCell={true}
                    isRowExpanded={isRowExpanded}
                    update={this.updateRow}
                    rowIndex={rowIndex}
                />)
            }

        }

        
        let subs = [];
        if(isRowExpanded){
            if(data.hasChild()){
                subs = <Rows key={'rest'}
                    level={level+1}
                    data={data.heir}
                    head={head}
                    tableAttr={tableAttr}
                />
            } else if (data.hasTable()){

                data.subs.tableAttr.height = 300;
                
                subs = <TR key={'rest'}>
                    <TDTab colSpan={colsWidth}><Formwell {...data.subs} /></TDTab>
                </TR>
            }
        }

        let tr = <TR key={'first'}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
        >{cols}</TR>

        return [tr, subs]

    }
}