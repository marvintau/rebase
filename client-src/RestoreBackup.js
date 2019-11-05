import React from 'react';
import styled from 'styled-components';

const InputGroup = styled.div`
    list-style:none;
    border: 0.5px solid black;
    border-radius: 5px;
    padding:5px 10px 5px 10px;
    margin: 10px 0;
`

const Note = styled.div`
    font-size: 80%;
    margin: 15px 5px;
`

const Button = styled.button`
    display:block;
    width: 100%;
    border: 1px solid gray;
    outline: none;
    border-radius: 5px;
    margin: 5px 0px;
    padding: 5px;
`


export default class RestoreBackup extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            restoreState: "NONE",
            progress : 0,
            remainingTime: 0
        }

        this.props.socket.on('PROG', (data) => {
            if (data.data){
                let {percent_complete, est_remaining_time} = data.data;
                this.setState({
                    restoreState: "RESTORING",
                    progress : percent_complete.toFixed(2), 
                    remainingTime : est_remaining_time
                });
            }
        }).on('RESTOREDONE', (data) => {
            this.setState({restoreState : "RESTOREDONE"});
        }).on('FILEPREPARED', () => {
            this.setState({restoreState : 'FILEPREPARED'})
        })
    }

    render(){

        let {path, projName, goto} = this.props;

        switch(this.state.restoreState){
            case "NONE":
                return <InputGroup>
                    <Note><b>{projName}</b></Note>
                    <Note>
                        <p>如果您首次上传了数据文件，或者在上次更新之后又上传了新的数据文件，您需要在这里更新。</p>
                        <p>您每次上传的文件都会保存下来，系统通过您上传的文件转换为内部数据，并通过内部数据进行计算。如果您上传了同名的文件，则会覆盖现有的文件。</p>
                    </Note>

                    <Button onClick={(e) => {
                        e.stopPropagation();
                        this.props.socket.emit('RESTORE', {projName})
                    }}>明白了，那么更新吧</Button>
                </InputGroup>;
            case "RESTORING":
                return <InputGroup>
                    <Note>已经恢复了{this.state.progress} %</Note>
                    <Note>剩余时间 {this.state.remainingTime}</Note>
                    <Note>NOTE: 这个时间有可能不准确，最好在完成后等待几秒再进行后续操作</Note>
                </InputGroup>
            case "RESTOREDONE":
                return <Note>
                    已完成数据库的恢复, 正在生成数据，可能要花几秒钟时间。
                </Note>
            case "FILEPREPARED":
                return <InputGroup>
                    <Note>数据文件已就绪。</Note>
                    <Button onClick={(e) => goto('sheets')}>返回到列表</Button>
                </InputGroup>
        }
    }
}