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

export default class UploadBackup extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            uploadState: "NONE",
            progress : 0,
        }

        this.blockSize = 524288;
        this.fileObj = undefined;
        this.fileRef = React.createRef();
        this.fileReader = new FileReader();

        this.fileReader.onload = (event) => {
            this.setState({uploadState: "UPDATING"})
            this.props.socket.emit('UPLOAD_SEND', {
                name: this.fileObj.name,
                segment: event.target.result
            });
        };
 
        this.nameRef = React.createRef();

        this.upload = this.upload.bind(this);
        this.updateFile = this.updateFile.bind(this);
    }

    componentDidMount(){

        const {address} = this.props;

        this.socket = io(`${address}/UPLOAD`);

        this.socket.on('MORE', (data)=>{
            this.setState({progress : data.percent});

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

    upload(){

        let destName = this.nameRef.current.value;
        let path = `${destName}-${Date.now()}.BAK`;

        this.props.socket.emit('UPLOAD_START', {
            name: this.fileObj.name,
            path,
            size: this.fileObj.size
        });
    }

    updateFile(){
        console.log('updated', this.fileRef);
        this.fileObj = this.fileRef.current.files[0];
    }

    render(){

        switch(this.state.uploadState){
            case 'NONE':
            case 'DONE':
                return (
                    <InputGroup>
                        <Input id="company-name" placeholder="帐套所属公司名称" ref={this.nameRef} />
                        <Input type="file" id="choose-backup-file" ref={this.fileRef} onChange={this.updateFile} />
                        <Button id="upload" onClick={this.upload}>上传</Button>
                    </InputGroup>)
            case 'UPDATING':
                return (
                    <InputGroup>
                        已上传 {this.state.progress} %
                    </InputGroup>)
        }
    }
}