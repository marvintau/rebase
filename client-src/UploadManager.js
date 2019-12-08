import React from 'react';
import io from 'socket.io-client';

import {Label, Button, FormGroup, FormText, Form, Input} from 'reactstrap';



const BLOCK_SIZE = 524288;

export default class UploadBackup extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            fileName: undefined,
            uploadState: "NONE",
            progress : 0,
        }

        this.fileObj = undefined;
        this.fileRef = React.createRef();
 
        this.nameRef = React.createRef();
        this.yearRef = React.createRef();
        this.fileTypeRef = React.createRef();
        this.bookTypeRef = React.createRef();
    }

    componentDidMount(){

        const {address} = this.props;

        this.socket = io(`${address}/UPLOAD`);

        this.socket.on('SEND', ({name, progress, position})=>{
            this.setState({
                progress,
                uploadState: 'MORE',
            });
            
            let sliceEnd = Math.min(position + BLOCK_SIZE, this.fileObj.size);

            for (let sliceMethod of ["slice", "webkitSlice", "mozSlice"]) if (this.fileObj[sliceMethod]){
                this.fileObj[sliceMethod](position, sliceEnd)
                    .arrayBuffer()
                    .then(buffer => {
                        this.socket.emit('RECV', { position, name, data: buffer });
                    })
                break;
            } else {
                throw new Error('上传文件：浏览器的版本比较旧，不支持Blob.slice方法。')
            }
        }).on('CREATE_DONE', () => {
            console.log('create done');
            this.setState({uploadState: 'CREATE_DONE'})
        }).on('DELETE_DONE', () => {
            console.log('delete done');
            this.setState({uploadState: 'DELETE_DONE'})
        }).on('DONE', () => {
            this.setState({uploadState : "DONE"});
        }).on('ERROR', ({msg}) => {
            let errMsg = {
                'EEXIST': '已经有一个同名的项目了'
            }[msg];
            this.setState({uploadState: 'ERROR', errMsg})
        });
    }

    componentWillUnmount(){
        this.socket.close();
    }

    upload = () => {

        let {projName} = this.props,
            id = localStorage.getItem('user_id');

        let fileType = this.fileTypeRef.current.value,
            bookType = this.bookTypeRef.current.value,
            year = this.yearRef.current.value;

        if(bookType === 'CASHFLOW_WORKSHEET' || bookType === 'FINANCIAL_WORKSHEET'){
            year = 0;
        }

        let payload = {
            id,
            projName,
            name: `SOURCE.${projName}.${bookType}.${year}.${fileType}`,
            size: this.fileObj.size,
        }

        this.socket.emit('PREP', payload);

        this.setState({
            uploadState: 'MORE'
        })
    }

    create = () => {
        let id = localStorage.getItem('user_id');
        let projName = this.nameRef.current.value;
        console.log('creating', projName, this.nameRef);
        this.socket.emit('CREATE', {projName, id})
        this.setState({
            uploadState: 'WAITING'
        })
    }

    delete = () => {
        let id = localStorage.getItem('user_id');
        let {projName} = this.props;
        console.log("deleting project", projName);
        this.socket.emit('DELETE', {id, projName})
        this.setState({
            updateState: 'WAITING'
        })
    }

    updateFile = () => {
        this.fileObj = this.fileRef.current.files[0];
        console.log('updated file. Size: ', this.fileObj.size);

        this.setState({
            fileName: this.fileObj ? this.fileObj.name : undefined
        })
    }

    guessFields = () => {
        if (this.fileObj !== undefined){
    
            let [base, fileType] = this.fileObj.name.split('.'),
                [year, bookType, projName] = base.split('-');
    
            fileType = {
                XLS : 'xls',
                xls : 'xls',
                XLSX: 'xlsx',
                xlsx: 'xlsx',
                csv:  'csv',
                CSV:  'csv',
                BAK:  'bak2019',
                bak:  'bak2019',
            }[fileType]
    
            bookType = {
                '序时账' : 'JOURNAL',
                '科目余额表' : 'BALANCE',
                '辅助核算明细表' : 'ASSISTED',
                '现金流编制明细' : 'CASHFLOW_WORKSHEET'
            }[bookType]
    
            this.fileTypeRef.current.value = fileType
            this.bookTypeRef.current.value = bookType
            this.yearRef.current.value = year
        }
    }

    render(){

        let {projName, toDelete} = this.props;
        let {fileName, uploadState} = this.state;

        if (projName == undefined){
            switch(uploadState){
                case 'NONE':
                    return <FormGroup>
                        <Label>客户名称</Label>
                        <input class="form-control" style={{margin:'3px'}} id="company-name" placeholder="项目（客户）名称" ref={this.nameRef} />
                        <Button id="upload" onClick={this.create}>创建</Button>
                        <FormText>项目名称一经创建则不能更改，请再三检查。如果写错名称，您必须先删除整个项目，并重新上传数据文件。</FormText>
                    </FormGroup>
                case 'WAITING':
                    return <FormGroup>请稍候…</FormGroup>
                case 'CREATE_DONE':
                    return <FormGroup>创建完成，请从项目列表中进入项目，并继续上传文件</FormGroup>                
                case 'ERROR':
                    return <FormGroup><Label>{this.state.errMsg}</Label></FormGroup>
            
            }
        } else if (toDelete){
            switch(uploadState){
                case 'DELETE_DONE':
                    return <FormGroup>项目已经清除，请从列表中进入项目，或建立新的项目</FormGroup>                
                case 'NONE':
                    return <FormGroup>
                        <Label>确定删除这个项目吗？</Label>
                        <Button id='delete' onClick={this.delete}>我确定了</Button>
                    </FormGroup>
            }
        }

        switch(uploadState){
            case 'DONE':
            case 'NONE':
                return <Form>
                    <FormGroup>
                        {uploadState === 'DONE' ? <Label>上传完毕，请返回至上一级，从列表中打开进行相应操作, 或者继续</Label> : []}
                        <Label>上传文件</Label>
                        <input className='file-input' type="file" id="choose-backup-file" ref={this.fileRef} onChange={this.updateFile} />
                        <Button color="info" onClick={this.guessFields}>猜名字</Button>
                    </FormGroup>
                    <FormGroup>
                        <Label>年度</Label>
                        <Input id="year" placeholder="会计年度" ref={this.yearRef} />
                        </FormGroup>
                    <FormGroup>
                        <Label>上传文件类型</Label>
                        <input className="form-control" id="file-type" type="select" ref={this.fileTypeRef}>
                            <option value='csv'>.CSV文件</option>
                            <option value='xls'>.XLS（Excel兼容格式）</option>
                            <option value='xlsx'>.XLSX（Excel2007及以上）</option>
                            <option value='bak2008'>.BAK（SQLServer2008以下）</option>
                            <option value='bak2019'>.BAK（SQLServer2008以上）</option>
                        </input>
                    </FormGroup>
                    <FormGroup>
                        <Label>数据类别</Label>
                        <input className="form-control" id="file-type" type="select" ref={this.bookTypeRef}>
                            <option value='BALANCE'>科目余额</option>
                            <option value='JOURNAL'>序时账</option>
                            <option value='ASSISTED'>辅助核算</option>
                            <option value='CASHFLOW_WORKSHEET'>现金流编制底稿</option>
                            <option value='FINANCIAL_WORKSHEET'>资产负债表编制底稿</option>
                        </input>
                        {(fileName !== undefined) ?
                            <Button id="upload" onClick={this.upload}>上传</Button> :
                            <Label>选择文件后才能上传</Label>
                        }
                    </FormGroup>
                </Form>
            case 'MORE':
                return (
                    <FormGroup>
                        已上传 {this.state.progress} %
                    </FormGroup>)
            case 'ERROR':
                return <FormGroup><Label>{this.state.errMsg}</Label></FormGroup>
        }
    }
}