import React from 'react';

import Cell from '../../Cell';
import Rows from '../Rows';
import Formwell from '../../Formwell';


function Indicator(props){

    const style = {
        borderTop: '1px solid black',
        borderBottom: '1px solid black',
        width: '25px',
        minWidth: '25px',
        maxWidth: '25px',
        padding: '5px',
    }

    let {data} = props;

    let type = data.subsType();

    style.backgroundColor = (type === 'Body' && data.subs.length > 0) ? 'salmon' : (type === 'Table') ? 'skyBlue' : 'white';

    return <td style={style} />
}

export default class Row extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            data: this.props.data,
            isRowEditing: false,
            isHovered: false,
        };
    }

    static getDerivedStateFromProps(props, state){
        if(!state.fromInside){
            if (props.data !== state.data){
                return {
                    data: props.data,
                    isRowEditing: false,
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

        let {expandable} = this.props,
            {data} = this.state;

        expandable = expandable && !(data.subs.length && data.subs.length === 0);
        console.log(expandable, 'expandable row');
        if (expandable){
            let {updateRowsExpanded, rowIndex} = this.props;
            updateRowsExpanded(rowIndex);
        }

    }

    toggleEdit = () => {
        console.log('togglededit')
        this.setState({
            isRowEditing: !this.state.isRowEditing,
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
        /**
         * 1. 首先显示必要的columns，包括显示是否存在子层数据的indicator，以及按规则
         *    呈现每一列（每一个单元格）的数据。
         */
        let {head, rowIndex} = this.props;
        let {data, isHovered, isRowEditing} = this.state;
        let sharedCellProps = {rowIndex, isHovered, isRowEditing, update: this.updateRow}

        let cols = [<Indicator key={'indi'} data={data}/>];

        for (let colKey in head){

            let {hidden} = head[colKey];

            let cellProps = { colKey, data: data.get(colKey), ...sharedCellProps, ...head[colKey]}

            // 如果单元格是title（Cols的attr中包含title属性，且其值为colKey），那么
            // cols将只包含一个cell，同时占满整个表格行。注意这是一个Cols-wise的属性，
            // 而且它将忽略下面的hidden判断。也就是说你可以将一个可能会包含title的列
            // 设为hidden，在不包含title的记录中这列将不显示，但是包含title的记录中
            // 则会只显示title。

            if (data.attr.title === colKey){
                cols.push(<Cell key={colKey} colSpan={head.lenDisplayed()} {...cellProps}/>)
                break;    
            }

            // 如果Head中列的属性被设为hidden（其值为true），那么不显示这一列。否则照
            // 常显示。
            if(!hidden){
                cols.push(<Cell key={colKey} {...cellProps}/>)
            }
        }

        /**
         * 2. 如果当前行是可以编辑的，那么就允许显示右侧的控制和编辑按钮。
         */

        let {editable} = this.props;

        if (editable && (data.attr.title === undefined)){
            // console.log
            cols.push(<Cell
                key={'ctrl'}
                toggleEdit={this.toggleEdit}
                isControlCell={true}
                {...sharedCellProps}
            />)
        }    

        /**
         * 3. 如果当前行是需要展开显示其子层数据的，那么把子层数据列在下方。
         */

        let subs = [];

        let {autoExpanded, expandedRowIndex, expandable} = this.props,
        isRowExpanded = autoExpanded || (rowIndex === expandedRowIndex);

        if(isRowExpanded){

            let subsType = data.subsType();
            
            if(subsType === 'Body' && data.subs.length > 0){
                subs = <Rows key={'rest'}
                    head={head}
                    data={data.subs}
                    editable={editable}
                    expandable={expandable}
                    autoExpanded={autoExpanded}
                />
            
            } else if (subsType === 'Table'){

                subs = <tr style={{width: 'auto'}} key={'rest'}>
                    <td colSpan={head.lenDisplayed()+1} style={{marginTop: '5px', width: 'auto'}}>
                        <Formwell tables={data.subs} />
                    </td>
                </tr>
            }
        }

        let tr = <tr key={'first'} style={{width: 'auto'}}
            onDoubleClick={this.toggleExpand}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
        >{cols}</tr>

        return [tr, subs]

    }
}