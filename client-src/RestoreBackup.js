import React from 'react';
import styled from 'styled-components';

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

    componentWillUnmount(){
        this.props.socket.close();
    }

    render(){

        let {path, back} = this.props;

        switch(this.state.restoreState){
            case "NONE":
                return <div>
                    <Note>您上一次上传的备份文件还没有复原，您需要先完成复原才能进行后续的操作。</Note>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        this.props.socket.emit('RESTORE', {path})
                    }}>现在就复原</Button>
                </div>;
            case "RESTORING":
                return <div>
                    <Note>已经恢复了{this.state.progress} %</Note>
                    <Note>剩余时间 {this.state.remainingTime}</Note>
                    <Note>NOTE: 这个时间有可能不准确，最好在完成后等待几秒再进行后续操作</Note>
                </div>
            case "RESTOREDONE":
                return <Note>
                    已完成数据库的恢复, 正在生成数据，可能要花几秒钟时间。
                </Note>
            case "FILEPREPARED":
                return <div>
                    <Note>数据文件已就绪。</Note>
                    <Button onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault();
                    }}>点此获取数据文件</Button>
                </div>
        }
    }
}