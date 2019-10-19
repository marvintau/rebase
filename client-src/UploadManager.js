import React from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';

const InputGroup = styled.div`
    list-style:none;
    border: 0.5px solid black;
    border-radius: 5px;
    padding:5px 10px 5px 10px;
    margin: 10px 0;
`
const Button = styled.button`
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 5px 0;
    padding: 5px;
`

const HDiv = styled.div`
    margin-top:5px;
    margin-bottom:5px;
    height:1px;
    width:100%;
    border-top:1px solid gray;
`

const Label = styled.label`
    font-size:80%;
    font-weight: bold;
`

const Input = styled.input`
    width: 90%;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 5px 0;
    padding: 5px;

    &[type=file]::-webkit-file-upload-button {
        border: 1px solid gray;
        border-radius: 5px;
        height: 100%;
        background-color: white;
        font-size: 80%;
    }
`

const Select = styled.select`
    width: 95%;
    height: 35px;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 5px 0;
    padding: 5px 10px;
`

export default class UploadBackup extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            fileName: undefined,
            uploadState: "NONE",
            progress : 0,
        }

        this.blockSize = 524288;
        this.fileObj = undefined;
        this.fileRef = React.createRef();
        this.fileReader = new FileReader();

        this.fileReader.onload = (event) => {
            this.socket.emit('SEND', {
                name: this.fileObj.name,
                segment: event.target.result
            });
            this.setState({uploadState: "MORE"})
        };
 
        this.nameRef = React.createRef();
        this.yearRef = React.createRef();
        this.fileTypeRef = React.createRef();
        this.bookTypeRef = React.createRef();
    }

    componentDidMount(){

        const {address} = this.props;

        this.socket = io(`${address}/UPLOAD`);

        this.socket.on('MORE', (data)=>{
            this.setState({
                progress : data.percent,
                uploadState: 'MORE',
            });

            if(this.blockSize === undefined)
                throw new TypeError('readblock: Blocksize not specified');
            
            var position = data.position * this.blockSize,
                sliceEnd = position + Math.min(this.blockSize, this.fileObj.size - position),
                fileSlice = null;

            for (let method of ["slice", "webkitSlice", "mozSlice"]) if (this.fileObj[method]){
                fileSlice = this.fileObj[method](position, sliceEnd);
                break;
            }

            if (fileSlice)
                this.fileReader.readAsBinaryString(fileSlice);
                // Note: the function readAsBinaryString will trigger the onLoad handler
                // of the fileReader.
        });

        this.socket.on('DONE', () => {
            this.setState({uploadState : "DONE"});
        });
    }

    componentWillUnmount(){
        this.socket.close();
    }

    upload = () => {

        let destName = this.nameRef.current.value,
            fileType = this.fileTypeRef.current.value,
            bookType = this.bookTypeRef.current.value,
            year = this.yearRef.current.value;

        let payload = {
            name: this.fileObj.name,
            path: `SOURCE.${destName}.${bookType}.${year}.${fileType}`,
            size: this.fileObj.size,
            fileType,
            bookType
        }

        console.log(payload);
        this.socket.emit('START', payload);
    }

    updateFile = () => {
        console.log('updated', this.fileRef);
        this.fileObj = this.fileRef.current.files[0];

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
                '辅助核算明细表' : 'ASSISTED'
            }[bookType]
    
            this.nameRef.current.value = projName
            this.fileTypeRef.current.value = fileType
            this.bookTypeRef.current.value = bookType
            this.yearRef.current.value = year
        }
    }

    render(){

        let {fileName, uploadState} = this.state;
        switch(uploadState){
            case 'DONE':
            case 'NONE':
                return (
                    <InputGroup>
                        {uploadState === 'DONE' ? <Label>上传完毕，请返回至上一级，从列表中打开进行相应操作, 或者继续</Label> : []}
                        <Label>上传文件</Label>
                        <Input type="file" id="choose-backup-file" ref={this.fileRef} onChange={this.updateFile} />
                        <Button onClick={this.guessFields}>猜名字</Button>
                        <HDiv />

                        <Label>客户名称</Label>
                        <Input id="company-name" placeholder="项目（客户）名称" ref={this.nameRef} />

                        <Label>年度</Label>
                        <Input id="year" placeholder="会计年度" ref={this.yearRef} />

                        <Label>上传文件类型</Label>
                        <Select id="file-type" ref={this.fileTypeRef}>
                            <option value='csv'>.CSV文件</option>
                            <option value='xls'>.XLS（Excel兼容格式）</option>
                            <option value='xlsx'>.XLSX（Excel2007及以上）</option>
                            <option value='bak2008'>.BAK（SQLServer2008以下）</option>
                            <option value='bak2019'>.BAK（SQLServer2008以上）</option>
                        </Select>

                        <Label>帐套类别</Label>
                        <Select id="file-type" ref={this.bookTypeRef}>
                            <option value='BALANCE'>科目余额</option>
                            <option value='JOURNAL'>序时账</option>
                            <option value='ASSISTED'>辅助核算</option>
                        </Select>
                        {(fileName !== undefined) ?
                            <Button id="upload" onClick={this.upload}>上传</Button> :
                            <Label>选择文件后才能上传</Label>
                        }
                    </InputGroup>)
            case 'MORE':
                return (
                    <InputGroup>
                        已上传 {this.state.progress} %
                    </InputGroup>)
        }
    }
}