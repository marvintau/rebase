import React from 'react';
import {render} from "react-dom";
import FileInput from './FileInput.js';

import {Router, Route, Link} from 'react-router-dom';
import { createBrowserHistory } from "history";
const customHistory = createBrowserHistory();

window.React = React;

import LedgerTable from "./Ledgitable/LedgerTable.js"
import bookData from './BookData';

import { BehaviorSubject } from 'rxjs';

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));

export const authenticationService = {
    login,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue () { return currentUserSubject.value }
};

// function login(username, password) {
//     const requestOptions = {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password })
//     };

//     return fetch(`${config.apiUrl}/users/authenticate`, requestOptions)
//         .then(handleResponse)
//         .then(user => {
//             // store user details and jwt token in local storage to keep user logged in between page refreshes
//             localStorage.setItem('currentUser', JSON.stringify(user));
//             currentUserSubject.next(user);

//             return user;
//         });
// }

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    currentUserSubject.next(null);
}

var Home = () => (<div>
    dsadsadsa
</div>)

function login(){

    fetch('users/authenticate/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'test',
            password: 'test',
        })
    }).then(res=>res.body)
    .then((body)=>{
        const reader = body.getReader();
        let result = "";

        return reader.read().then(function process({done, value}){
            if(done) {
                return result;
            } else {
                result += new TextDecoder("utf-8").decode(value);
                return reader.read().then(process);
            }
        })

    }).then(res => {

        localStorage.setItem('currentUser', res);
        currentUserSubject.next(JSON.parse(res));

    })
    .catch(e => {
        // fancier error handler
        console.error(e);
    })
}

class TopBar extends React.Component {
    render(){
        return (
            <nav className="navbar navbar-style navbar-default navbar-fixed-top">
        
            <a href='#' style={{float: "right"}}><h1 style={{letterSpacing: "-0.07em"}}>
                    <img src="a61ce20ec695c877e21b8ea099fe49c8.png" width={40}/> Auditool 审计通
                </h1></a>
            <a href='#' style={{float: "right"}} onClick={login}>登录</a>

            </nav>
        )
    }
}

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