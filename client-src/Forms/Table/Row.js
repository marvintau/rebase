import React from 'react';
import styled from 'styled-components';

import Cell from '../Cell/Cell';
import Rows from './Rows';
import Formwell from '../Formwell';

const TRBar = styled.tr`
    height: 5px;
`

const TDTab = styled.td`
    margin-top: 5px;
    width: auto;
`

const Indicator = styled.td`
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    width: 25px;
    min-width: 25px;
    max-width: 25px;
    padding: 5px;
    background-color : ${({hasTable, hasChild})=> hasTable ? 'skyBlue' : hasChild ? 'salmon' : 'transparent'} 
`

const TR = styled.tr`
    width: auto;
`

export default class Row extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            data: this.props.data,
            isHovered: false,
        };
    }

    static getDerivedStateFromProps(props, state){
        if(!state.fromInside){
            if (props.data !== state.data){
                return {
                    data: props.data,
                    editing: false,
                    isHovered: false,
                    fromInside : false,
                }
            }
        } else {
            return {...state, fromInside: false}
        }
        return state;
    }

    updateRow = (type, method, args) => {

        
        if (type === 'list') {
            console.log(type, method, args, 'updateRow');
            this.props.updateRows(method, args);
        } else if (type === 'self'){
            this.state.data[method](...args);
        }
    }

    toggleExpand = () => {
        let {updateRowsExpanded, rowIndex} = this.props;
        updateRowsExpanded(rowIndex);
    }

    toggleEdit = () => {
        console.log('togglededit')
        this.setState({
            editing: !this.state.editing,
            fromInside: true
        })
    }

    onMouseEnter = ()=>{
        this.setState({
            isHovered: true,
            fromInside: true,
        });
    }

    onMouseLeave = ()=>{
        this.setState({
            isHovered: false,
            fromInside: true
        });
    }

    render(){

        let {rowIndex, level, head, tableAttr={}, rowsExpanded} = this.props;
        
        let {data, editing, isHovered} = this.state,
            {expandable, autoExpanded, editable} = tableAttr,
            isRowExpanded = autoExpanded || (rowIndex === rowsExpanded);

        expandable = expandable && (data.hasChild() || data.hasTable());

        editable = editable && (data.attr.title === undefined)

        let sharedCellProps = {
            level,
            update: this.updateRow,
            toggleExpand: this.toggleExpand,
            ...tableAttr, 
            expandable
        }

        let colSpan = head.lenDisplayed();

        let cols = [
            <Indicator key={'indicator'}
                hasTable={data.hasTable()}
                hasChild={data.hasChild()}
            />];

        for (let colKey in head){

            let cellProps = {
                ...sharedCellProps,
                ...head[colKey],
                isHovered, rowsExpanded,
                isRowEditing: editing,
                colKey: colKey,
                data: data.get(colKey),
            }

            cellProps.isTitle = cellProps.isTitle || (data.attr.title === colKey);
            if (cellProps.isTitle){

                // 如果是title，那么cols将只包含一个cell，同时占满整个表格行。需要注意的是，
                // 如果head中包含的title字段，在data中并不包含，或者data中包含的内容（即
                // 字符串）是空的，那么都不会作为title来处理。
                cols.push(<Cell key={colKey} colSpan={colSpan} {...cellProps}/>)
                break;    

                // let title = data.get(colKey);
                // if (title && title.length > 0 && title != 'undefined'){
                // } else {
                //     // 如果title是空的，那么会直接被跳过去。
                //     continue;                    
                // }
            }

            if(!(cellProps.hidden)){
                cols.push(<Cell key={colKey}{...cellProps}/>)
            }
        }

        if (editable){

            let {editing} = this.state;

            cols.push(<Cell
                key={'ctrl'}
                rowIndex={rowIndex}
                isControlCell={true}
                isHovered={isHovered}
                isRowEditing={editing}
                update={this.updateRow}
                toggleEdit={this.toggleEdit}
            />)
        }    

        let subs = [];
        if(isRowExpanded){
            if(data.hasChild()){
                subs = [
                    <TRBar key={'barT'} />, 
                    <Rows key={'rest'}
                        colSpan={colSpan+1}
                        level={level+1}
                        data={data.heir}
                        head={head}
                        tableAttr={tableAttr}
                    />,
                    <TRBar key={'barB'} />, 
                ]
                if(autoExpanded){
                    subs = subs[1];
                }
            } else if (data.hasTable()){

                console.log(data, 'before subtable');

                subs = <TR key={'rest'}>
                    <TDTab colSpan={colSpan+1} ><Formwell sections={data.subs} /></TDTab>
                </TR>
            }
        }

        let tr = <TR key={'first'}
            onDoubleClick={this.toggleExpand}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
        >{cols}</TR>
        return [tr, subs]

    }
}