import React from 'react';
import styled from 'styled-components';

import SheetComp from './SheetComp';
import BodyCell from "./BodyCell.js";
import FilterComponent from './FilterComponent.js';

/**
 * BodyRow
 * =======
 * 
 * BodyRow组件同时承担了显示数据，以及基于行的交互操作。需要注意的是，BodyRow是一个递归结构。
 * 由于报表目录存在层级关系，因此表格行所表示的数据本身具有层级关系，因此在显示这些层级数据时，
 * BodyRow会在Render方法中形成新的BodyRow实例。
 * 
 * BodyRow的交互功能
 * ----------------
 * 
 * 1. BodyRow需要提供显示/隐藏**子层数据**和**明细表**的功能。关于这一点，我们基于数据的实际
 *    形式，规定只有叶子节点的数据（也就是不再包含子层数据）的记录才能够显示明细表。因此，如果
 *    BodyRow拥有子层数据，则只能提供显示/隐藏子层数据的交互，只有到最底层不再有子层数据时，
 *    才能够显示明细表。这一点需要在Render当中做判断
 * 
 * 2. BodyRow可以对子层数据进行**排序**或**筛选**的操作，这些交互接口应当在显示子层数据的时候
 *    提供。BodyRow需要将和排序及筛选相关的信息（如排序的key column或筛选条件）记录在state中。
 *    BodyRow的组件ControlCell承担对这个状态进行更改的任务，通过一个callback进行更改。由于它
 *    从state中读取信息作为自己的prop，考虑使用**getDerivedStateFromProps**
 *    
 * 3. **明细表**是一个内嵌的子表格，在td元素中插入一个SheetComp组件。
 * 
 * BodyRow的行为
 * ---------------
 * 
 * 按上述交互功能的描述，BodyRow的具体行为包括
 * 
 * 1. 显示
 *    显示为一个tr元素，并依据其层级按不同颜色深度显示。
 * 
 * 2. 显示子层数据/明细表
 *    通过在Render时检查子层数据实现，不需要维持状态
 * 
 * 3. 显示子层数据时显示排序/筛选的选项
 *    单击子层数据后出现一个表宽度的单元格，单元格中包含两个tab按钮，分别是排序和筛选，单击后
 *    出现对应选项。
 * 
 */


/**
 * colorLerp
 * @param {number} ratio 插值比例
 * @param {number} offset 插值偏移
 * @param {object} back 背景色
 * @param {object} front 前景色
 */
function colorLerp(ratio, offset=0,
    back={r:160, g:109, b:125},
    front={r:245, g:245, b:235}){    
    let newC = {
        r: back.r + (front.r - back.r) * ratio + offset,
        g: back.g + (front.g - back.g) * ratio + offset,
        b: back.b + (front.b - back.b) * ratio + offset
    };

    return `rgb(${newC.r}, ${newC.g}, ${newC.b})`;
}

// Styled Components

const Record = styled.tr`
    line-height: 1.1em;

    &:hover{
        background-color: #f0c674 !important;
    }
`

const Subtable = styled.td`
    text-align: center;
    font-size: 40%;
    background: #34567888;
    margin: 10px;
    padding: 10px;
`

const Vertical = styled.div`
`

// 用来分割子层数据和后面表格的组件
const TRDiv = styled.tr`
    height: 0px;

    .placeholder{
        height: 1px !important;
    }
`

const Select = styled.select`
    padding-bottom: 3px;
    margin: 0px 5px;
`

const FlexBox = styled.div`
    display: flex;
    justify-content: space-between;
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


function SubsControl(props){

    let {head} = props; 

    return <tr><td colSpan={head.length}>
        <FlexBox>
        {props.children}
        </FlexBox>
    </td></tr>

}


export default class BodyRow extends React.Component {

    constructor(props, context){
        super(props, context);

        // we don't want refresh when sort col changes. 
        this.sortCol = props.head[0].colKey;

        this.state = {
            sortOrder  : 'none',
            filterSpec : 'none',
        }
    }

    applySort = (e) => {
        console.log('new order', e.target.value);
        this.setState({
            sortOrder: e.target.value
        })
    }

    applyFilter = (res) => {
        this.setState({
            filterSpec: res
        })
    }

    static getDerivedStateFromProps(props, state) {
        return {};
    }

    render() {
        const {record, level, head, currPath, controlType, setRecordPath} = this.props;
    
        let {path} = record;

        let isAncestor, isCurrent;
        if(path.length > 0){
            isAncestor = currPath.slice(0, level+1).join() === path.join();
            isCurrent = isAncestor && currPath.length == level+1;
            let isChildren = path.slice(0, -1).join() === currPath.join();
            let showingRoot = path.length === 1 && currPath.length === 1;
            let toDisplay = isAncestor || isChildren || showingRoot;
    
            if(!toDisplay){
                return <TRDiv></TRDiv>
            }    
        }

        // 1. 先准备本行数据的DOM，保存在recordElem里。 

        let ratio = (level+1) / (level + record.subDepth);

        let style = {
            fontWeight: this.displayDetails && record.subs.length > 0 ? 'normal' : 'bold',
            color: colorLerp(ratio*0.5, -100),
            backgroundColor: colorLerp(ratio)
        };

        let colElems = record.toList(head)
                // .filter(col=>col.attr == undefined || col.attr.display !== 'none')
                .map(col => {
                let {colKey, value, attr} = col;
                return <BodyCell
                    key={colKey}
                    column={colKey}
                    data={value}
                    attr={attr}
                    update={(key, newVal) => {
                        record.set(key, newVal);
                        console.log(record.cols, 'updated rec')
                    }}
                />
            });

        let recordElem = <Record
                style={style}
                key={'rec'}
                onClick={() => {
                    console.log('subs', record, path);
                    setRecordPath(path)
                }}
            >{colElems}</Record>

        // 2. 再准备显示子层数据所需要的内容，包括控制显示的单元格都保存在
        //    subs中. 需要注意的是，state中排序和筛选相关的状态在这里会用
        //    到。我们这里要生成一个record.subs的副本，用来存储排序和筛选
        //    的结果，同时不会伤害到原始数据。
        
        let columnOptions = head
            .filter(e=>e.attr && e.attr.sortable)
            .map(e => <option key={e.colKey} value={e.colKey}>{e.name}</option>);

        let sortControl = <SubsControl key="ctrl" head={head}>

            <div style={{display: 'flex', alignItems:'center'}}>
            排序
            <Select onChange={(e) => {this.sortCol=e.target.value}}>
                {columnOptions}
            </Select>

            <Select onChange={this.applySort} >
                <option key='none' value='none'>不排列</option>
                <option key="asce" value="asce">升序排列</option>
                <option key='desc' value='desc'>降序排列</option>
            </Select>
            </div>

            <FilterComponent head={head} applyFilter={this.applyFilter} />

        </SubsControl>

        let ADControl = <SubsControl key='ctrl' head={head}>
            <Button>添加条目</Button><Button>删除条目</Button>
        </SubsControl>

        let subsElems = [];

        if(isAncestor){

            // 如果显示子层数据
            if(record.subs.length > 0){

                // 只有当子层数据数量多于1时才会显示排序和筛选的控制区。减少不必要的显示。
                if(record.subs.length > 1 && isCurrent){
                    console.log(controlType, 'controlType');
                    if(controlType == 'DATA')
                        subsElems.push(sortControl);
                }

                // 然后创建子层数据的副本，用于apply排序和筛选操作。
                let subsCopy = record.subs.slice();
                let {sortOrder, filterSpec} = this.state;

                // 进行排序和筛选
                if(sortOrder !== 'none'){
                    subsCopy.tros(e => e.get(this.sortCol), sortOrder==='asce' ? 1 : -1);
                    console.log(subsCopy.map(e => e.get(this.sortCol)), 'sort happens');
                }

                if(filterSpec !== 'none'){
                    console.log('filter enabled', filterSpec);
                    let {column, seq, oper, sample, cond, limit} = filterSpec; 
                    if(seq === 'rnd'){
                        // subsCopy = subsCopy.randomSample(sample);
                        console.log(seq, 'random sample');
                    }
                    if (seq === 'seq') {

                        if (isNaN(sample)) {
                            sample = subsCopy.length;
                        }

                        console.log(sample, 'seq')

                        subsCopy = subsCopy.slice(0, sample);
                    }
                    if(seq === 'sng'){

                        let actualOp = {
                            'gt' : '>',
                            'lt' : '<',
                            'eq' : '===',
                        }[oper];

                        console.log('filter', oper,  `${column} ${actualOp} ${limit}`);
                        subsCopy = subsCopy.filter((e) => eval(`${e.get(column)} ${actualOp} ${limit}`))
                    }
                    if(seq === 'sum'){
                        console.log(subsCopy.accum(column));
                    }
                } else {
                    // console.log(record)
                    // console.log('filter disabled', filterSpec);
                }
    
                subsElems.push(...subsCopy.map((child, i) => {
                    return <BodyRow
                        key={i}
                        head={head}
                        record={child}
                        level={level+1}
                        currPath={currPath}
                        setRecordPath={setRecordPath}
                    />
                }))
    
                subsElems.push(<TRDiv key="subdiv" head={head} />);
            } else if(record.tabs){

                console.log('showing subtables', record.tabs);

                if(controlType === 'CONF')
                    subsElems.push(ADControl);

                let detailed = <tr key="subtable"><Subtable colSpan={colElems.length}><Vertical>
                    <SheetComp
                        style={{tableLayout: 'fixed'}}
                        table={record.tabs}
                        paged={true}    
                    />
                </Vertical></Subtable></tr>
    
                subsElems.push(detailed)
            }
        }

        return ([recordElem, subsElems]);
    }
}
