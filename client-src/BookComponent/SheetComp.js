import React from 'react';
import styled from 'styled-components';

import ReactTooltip from 'react-tooltip'

import HeadRow from "./HeadRow.js";
import BodyRow from "./BodyRow.js";
import GroupController from './GroupController.js';
import List from '../Booking/List.js';

const TableScroll = styled.div`
    width: 100%;
    overflow-y: auto;
`

const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
`

const TableHead = styled.thead`
    background-color: #2e2e2e !important;
    color: white;
    position: sticky;
    top : 0;
`

const Container = styled.div`
    width: 100%;
`

const Button = styled.button`
    display:inline-block;
    position: relative;
    left: 0;
    width: 100px;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 5px;
    padding: 5px;
`

export default class SheetComp extends React.Component {

    constructor(props, context){
        super(props, context);
        this.state = {};
    }
    
    componentDidMount(){
        this.setState({
            path: new List(0),
            page: 0
        });
    }

    static getDerivedStateFromProps(props, state) {
        return {};
    }

    switchPage = (newPage) => {
        this.setState({
            page: newPage
        })
    }

    switchGroupPath = (key, level) => {

        let {table} = this.props,
            path = table.getNewPath(this.state.path, key, level);

        this.setState({path});

    }

    render() {

        let {table, pageSize, currPath, setRecordPath=()=>{}, save} = this.props;
        let head = table.head.filter(e => e.attr === undefined || e.attr.display !== 'none');

        let {groupRef, groupPath, opts} = table.getGroup(this.state.path);
        
        pageSize = pageSize ? pageSize : 5;

        // console.log(groupRef, groupRef.length);

        let currPage = this.state.page,
            keys = Array(parseInt(groupRef.length / pageSize)+1).fill(0).map((_, index) => index),
            page = groupRef.slice(currPage * pageSize, (currPage + 1) * pageSize);

        let controlType = table.type;

        let pageRows = page.map((record, rowNum) =>{

            return (<BodyRow 
                key={rowNum}
                head={head}
                record={record}
                level={0}
                currPath={currPath}
                controlType={controlType}
                setRecordPath={setRecordPath}
            />)
        })
        
        let paginator;
        if (groupRef.length > pageSize){
            paginator = <GroupController
            options={[{desc: '页', keys}]}
            items={page.length}
            switchPage={this.switchPage}
            path={[currPage]} 
            type="paginator"/>
        }

        let saveButton = <Button onClick={() => save(table)}>保存</Button>

        return(
            <Container>
            <div style={{float: 'left', width: '800px'}}>
            <GroupController
                options={opts}
                switchPage={this.switchGroupPath}
                path={groupPath}
                type="paginator"
            />
            {paginator}
            <TableScroll><Table>
            <TableHead><HeadRow
                cols={head}
            /></TableHead>
            <tbody>
                {pageRows}
            </tbody>
            </Table></TableScroll>
            </div>
            <div style={{float: 'left'}}>
            {table.type === 'CONF' ? saveButton : undefined}
            </div>
            </Container>
        );
    }
}