import React from 'react';
import BodyCell from "./BodyCell.js";
import LedgerTable from "./LedgerTable";

export default class BodyRow extends React.Component {

    constructor(props, context){
        super(props, context);
        this.state = {
            displayChildren : false,
            displayVouch : false
        }
    }

    toggleDisplayChildren(){
        this.setState({
            displayChildren: !this.state.displayChildren
        })
    }

    toggleDisplayVouch(){
        this.setState({
            displayVouch : ! this.state.displayVouch
        })
    }

    render() {
        const {row, path, columnAttr, update, isReadOnly} = this.props;

        let editButton;
        if(row.children){
            editButton = (
                <button
                className="btn-sm btn-modify btn-info"
                onClick={(e) => {this.toggleDisplayChildren()}}
                >{ this.state.displayChildren ? "收拢" : "展开"}</button>
            )
        } else {
            editButton = [
                <button key={0} className="btn-sm btn-modify btn-outline-primary" onClick={(e) => { update('insert', path);}}>插入</button>,
                <button key={1} className="btn-sm btn-modify btn-outline-danger"  onClick={(e) => { update('remove', path);}}>删除</button>,
            ]
            if (row.voucher){
                editButton.push(<button
                    key={2}
                    className="btn-sm btn-modify btn-outline-info"
                    onClick={(e) =>{this.toggleDisplayVouch()}}
                    >{this.state.displayVouch ? "隐藏凭证" : "查看凭证"}</button>);
            }
        }

        let editCell = isReadOnly ? [] : <td className="edit-bar" key="edit">{editButton}</td> ;

        let editable = row.children === undefined;
        
        const colElems = [];
        for (let colName in row) {
            colElems.push(<BodyCell
                key={colName}
                path={path}
                col={colName}
                data={row[colName]}
                attr={columnAttr[colName]}
                editable={editable}
                update={update}
            />)
        };

        let vouch = [];
        if(this.state.displayVouch && row.voucher){
            vouch.push(<tr key={'vouch'}><td colSpan={row.keys().length+1}>
            <LedgerTable
                table={row.voucher}
                recordsPerPage={10}
                isReadOnly={true}
                tableStyle={'table-embedded'}
            />
            </td></tr>)
        }

        let childrenRows = [];
        if(row.children && this.state.displayChildren){
            childrenRows = row.children.map((child, i) => {
                return <BodyRow
                    key={i}
                    row={child}
                    path={path.concat(i)}
                    columnAttr={columnAttr}
                    update={update}
                />
            })
        }

        return ([<tr key={'rec'}>{editCell}{colElems}</tr>, vouch, childrenRows]);
    }
}
