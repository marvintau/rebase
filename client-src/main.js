import io from 'socket.io-client';

import React from 'react';
import {render} from "react-dom";
import FileInput from './FileInput.js';

import {Router, Route, Link} from 'react-router-dom';
import { createBrowserHistory } from "history";

window.React = React;

import LedgerTable from "./Ledgitable/LedgerTable.js"
import bookData from './BookData';

// var socket = io.connect();

const customHistory = createBrowserHistory();


class Login extends React.Component {

}

var Home = () => (<div>
    dsadsadsa
</div>)

var TopBar = () => (
    <Router history={customHistory}>
        <nav className="navbar navbar-style navbar-default navbar-fixed-top">
            

        <Link to='/' style={{float: "right"}}><h1 style={{letterSpacing: "-0.07em"}}>
                <img src="a61ce20ec695c877e21b8ea099fe49c8.png" width={40}/> Auditool 审计通
            </h1></Link>
        <Link to='/login' style={{float: "right"}}>登录</Link>
    
        </nav>
        <Route exact path="/" component={Home} />
        <Route path='/login' component={Login} />
    </Router>
)

render(<TopBar />, document.getElementById('root'));

// let localOnLoad = (event) => {
    
//     let data = JSON.parse(event.target.result),
//         journal = bookData(data);
    
//     render(<LedgerTable
//         table={journal}
//         recordsPerPage={30}
//         isReadOnly={false}
//         tableStyle={'table-outer'}
//     />, document.getElementById("container"));

// };

// render(<FileInput type={'text'} onload={localOnLoad} />, document.getElementById('local-upload'));

// backupFile.setStartFunc((instance) =>{
//     socket.emit('start', {
//         name: instance.file.name,
//         size: instance.file.size
//     });
// });

// backupFile.setOnload((event, instance) => {
//     socket.emit('upload', {
//         name: instance.file.name,
//         segment: event.target.result
//     });
// });

// $('#choose-backup-file').on('change', function () {
//     // console.log('here');
//     backupFile.start('choose-backup-file');
// });


// $('#dump-data').on('click', function(){
//     FileSaver.saveAs(new Blob([JSON.stringify(tables)], {type: "mime"}), "tables.json");
// })

// var updateIndicator = function(message){
//     document.getElementById('indicator').innerText = message;
// }

// var updateIndicatorErr = function(message){
//     document.getElementById('indicator').innerText += "\n" + message;
// }

// socket.on('more', function (data) { 
//     updateIndicator("已上传 " + data.percent.toFixed(1)+"% 注意请不要这个时候刷新页面");
//     backupFile.readSlice(data.position);
// });

// socket.on('msg', function (data) {
//     switch(data.type){
//         case "UPLOAD_DONE":
//             backupFile.dispose();
//             updateIndicator("上传完成。后台正在复原您刚上传的SQL备份数据，可能要花几分钟。");
//             break;
//         case "RESTORE_DONE":
//             updateIndicator("数据恢复完成，准备显示数据。");
//             break;
//         case "DATA":
//             updateIndicator(`接收到数据表 :[${data.tableName}]`);
//             Object.assign(tables, {[data.tableName]:data.data});
//             break;

//         default :
//             updateIndicatorErr("服务器发来了不知道什么类型的消息，有可能是个bug : ["+ data.type + "]");
//     }
// });