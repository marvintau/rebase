import React from 'react';

export default class FileInput extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);

        this.fileInput  = React.createRef();
        this.fileReader = new FileReader();
        this.fileReader.onload = this.props.onload;

        this.blockSize  = 524288; 

    }
    onChange(event) {

        let type = this.props.type;

        event.preventDefault();

        switch(type){
            case 'text':
                this.fileReader.readAsText(this.fileInput.current.files[0]);
                break;
            case 'binary':
                this.fileReader.readAsBinaryString
                break;
        }

        // if (this.file)
        //     this.props.startFunc(this);
        // else    
        //     throw new TypeError('FileStub.start: either file not prepared, or startFunc not defined');

    }
  
    render() {
        return (
            <div className="input-group col-md-12">
                <input key="input" type="file" className="custom-file-input" id="local-file-upload" onChange={this.onChange} ref={this.fileInput}/>
                <label className="custom-file-label" htmlFor="local-file-upload">选择上传一个导出到本地的.JSON文件</label>
            </div>
        );
    }
}
