import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
    margin-left: 5px;
    display:block;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
`

const FlexBox = styled.div`
    display: flex;
    justify-content: space-between;
`

const Input = styled.input`
    margin: 0px 5px;
    height: 16px !important;
    width: 50px !important;
`

const Select = styled.select`
    padding-bottom: 3px;
    margin: 0px 5px;
`

export default class FilterComponent extends React.Component {
    constructor(props, context){
        super(props, context);

        this.state = {
            column  : props.head[0].colKey,
            seq: 'seq',
            oper: 'gt',
            sample  : NaN,
            limit   : Infinity,
            applied : false
        }
    }

    setCol = (e) => {
        this.setState({
            column: e.target.value
        })
    }

    setSeq = (e) => {
        this.setState({
            seq: e.target.value
        })
    }

    setSample = (e) => {
        this.setState({
            sample: parseInt(e.target.value)
        })
    }

    setOper = (e) => {
        this.setState({
            oper: e.target.value
        })
    }

    setLim = (e) => {
        this.setState({
            limit: parseFloat(e.target.value)
        })
    }

    apply = () => {
        let {column, seq, oper, sample, limit, applied} = this.state;

        let {applyFilter} = this.props;

        let res = applied ? 'none' : {column, seq, oper, sample, limit, applied};

        applyFilter(res);

        this.setState({
            applied : !applied
        })
    }

    render(){

        let {head} = this.props;

        let columnOptions = head
            .filter(e=>e.attr && e.attr.sortable)
            .map(e => <option key={e.colKey} value={e.colKey}>{e.name}</option>);
                
        let sampleComp = <div><Input onChange={this.setSample} placeholder="多少"/>条记录</div>;
        
        let limitComp = <div>使得对于列
            <Select onChange={this.setCol}>
                {columnOptions}
            </Select>满足
            <Select onChange={this.setOper} value='gt'>
                <option key='gt' value='gt'>大于</option>
                <option key='lt' value='lt'>小于</option>
                <option key='eq' value='eq'>等于</option>
            </Select>
            <Input placeholder="多少" onChange={this.setLim}/>
        </div>

        let comp = (this.state.seq === 'seq' || this.state.seq === 'rnd') ? sampleComp : limitComp;

        let enabled = <FlexBox>
            <Select onChange={this.setSeq} value='seq'>
                <option key='seq' value='seq'>顺序抽取</option>
                <option key='rnd' value='rnd'>随机抽取</option>
                <option key='sng' value='sng'>测试每条</option>
                <option key='sum' value='sum'>顺序求和</option>
            </Select>
            {comp}
        </FlexBox>

        let appliedSeq = {
            seq: '顺序抽取',
            rnd: '随机抽取',
            sng: '测试每条',
            sum: '顺序求和'
        }[this.state.seq]

        let appliedSample = this.state.sample ? this.state.sample : '全部';

        let appliedOper = {
            gt: '大于',
            lt: '小于',
            eq: '等于'
        }[this.state.oper];

        let appliedLimit = this.state.limit;

        let condDesc = (this.state.seq === 'seq' || this.state.seq === 'rnd') ? `抽取${appliedSample}记录` : `抽取记录，满足条件${appliedOper}${appliedLimit}`,
            condText = this.state.applied ? `以${appliedSeq}的方式 ${condDesc}` : '';

        return <div style={{display: 'flex', alignItems:'center'}}>
            {this.state.applied ? condText : enabled}
            <Button onClick={this.apply}>{ this.state.applied ? '取消筛选' : '应用筛选'}</Button>
        </div>
    }
}
