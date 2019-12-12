import React from 'react';
import io from 'socket.io-client';

import {Label, Button, FormGroup, FormText, Form, Input} from 'reactstrap';

const BLOCK_SIZE = 524288;

function BoldLabel(props){
    let {children} = props;
    return <Label className="font-weight-bold" >{children}</Label>
}

function HoriGroup(props){
    let {children} = props;
    return <FormGroup style={{margin:'0px 10px'}}>{children}</FormGroup>
}

function Tip(props){
    let {children} = props;
    return <div style={{color:'#B86162'}}>{children}</div>
}

export default class UploadManager extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            fileName: undefined,
            uploadState: "NONE",
            progress : 0,
            bookType: 'NONE',
        }

        this.fileObj = undefined;
        this.fileRef = React.createRef();
    }

    componentDidMount(){

        const {address, projName} = this.props;
        const id = localStorage.getItem('user_id');

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
                        this.socket.emit('RECEIVE', {id, position, projName, name, data: buffer });
                    })
                break;
            } else {
                throw new Error('上传文件：浏览器的版本比较旧，不支持Blob.slice方法。')
            }
        }).on('RECEIVE_DONE', () => {
            this.setState({uploadState : "RESTORING"});
            this.socket.emit('RESTORE', {id, projName})
        }).on('RESTORE_DONE', () => {
            this.setState({
                uploadState : "DONE",
                fileName: undefined,
                bookType: "NONE",
                progress: 0
            });
        }).on('ERROR', ({msg}) => {
            this.setState({uploadState: 'ERROR', msg})
        });
    }

    componentWillUnmount(){
        this.socket.close();
    }

    upload = () => {

        let {projName} = this.props,
            id = localStorage.getItem('user_id');

        let {bookType, fileName} = this.state,
            fileType = fileName.split('.').pop().toLowerCase();

        console.log(projName, 'projName');

        let payload = {
            id,
            projName,
            name: `SOURCE.${bookType}.${fileType}`,
            size: this.fileObj.size,
        }

        this.socket.emit('PREPARE_TO_RECEIVE', payload);

        this.setState({
            uploadState: 'MORE'
        })
    }

    updateFile = () => {
        this.fileObj = this.fileRef.current.files[0];
        console.log('updated file. Size: ', this.fileObj.size);

        this.setState({
            fileName: this.fileObj ? this.fileObj.name : undefined
        })
    }

    selectFileType = (e) => {
        let {value: bookType} = e.target;
        this.setState({bookType})
    }

    render(){

        let {uploadState} = this.state;

        switch(uploadState){
            case 'DONE':
            case 'NONE':
                let {fileName, bookType} = this.state;

                let bookTypeOptions = {
                    NONE : '未选择',
                    BALANCE : '科目余额',
                    JOURNAL : '序时账',
                    // ASSISTED : '辅助核算',
                    CASHFLOW_WORKSHEET : '现金流编制底稿',
                    FINANCIAL_WORKSHEET : '资产负债表编制底稿',
                }

                return <Form style={{display:"flex", flexDirection:'row'}}>
                    <HoriGroup>
                        <BoldLabel>{uploadState==='DONE' && '继续'}上传文件</BoldLabel>
                        <input className='file-input' type="file" id="choose-backup-file" ref={this.fileRef} onChange={this.updateFile} />
                        {fileName === undefined 
                         ? <Tip>您还没选择要上传的文件</Tip>
                         : fileName.match(/.xlsx?|.XLSX?/) === null
                         ? <Tip>当前只支持Excel文件(.xls或.xlsx)</Tip>
                         : undefined}
                    </HoriGroup>
                    <HoriGroup>
                        <BoldLabel>数据类别</BoldLabel>
                        <select className="form-control" id="book-type" name="bookType" onChange={this.selectFileType}>
                            {Object.entries(bookTypeOptions).map(([k, v], i) => {
                                return <option key={i} value={k}>{v}</option>
                            })}
                        </select>
                        {bookType === 'NONE' && <Tip>您还没选择待上传数据的类别</Tip>}
                    </HoriGroup>
                    <HoriGroup>
                        {(fileName && bookType!== 'NONE' ) && <Button id="upload" color="success" style={{margin: '29px 5px 0px'}} onClick={this.upload}>上传</Button>}
                    </HoriGroup>
                    <HoriGroup>
                        {bookType !== 'NONE' && <div style={{marginTop: '35px'}}>
                            <a href={`./static/${bookType}.xlsx`} download>查看 {bookTypeOptions[bookType]} 的范例</a>
                        </div>}
                    </HoriGroup>
                </Form>
            case 'MORE':
                return (
                    <FormGroup>
                        已上传 {this.state.progress} %
                    </FormGroup>)
            case 'RESTORING':
                return (
                    <FormGroup>
                        上传完成，正在处理已上传数据
                    </FormGroup>)
            case 'ERROR':
                return <FormGroup><Label>{this.state.errMsg}</Label></FormGroup>
        }
    }
}