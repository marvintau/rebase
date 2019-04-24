import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { BehaviorSubject } from 'rxjs';

const currentUserSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('currentUser')));

function login(username, password){

    return fetch('users/authenticate/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password,
        })
    }).then(res=>{
        return res.text().then(text => {
            console.log('text to be parsed: ', text);
            const data = text && JSON.parse(text);
            if (!res.ok) {
                if ([401, 403].indexOf(res.status) !== -1) {
                    logout();
                }
    
                const error = (data && data.message) || res.statusText;
                return Promise.reject(error);
            }
    
            return data;
        });
    }).then(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUserSubject.next(user);

        return user;
    })
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    currentUserSubject.next(null);
}

const authenticationService = {
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue () { return currentUserSubject.value }
};

function formEntry(fieldName, placeholder, errors, touched){
    return (<div className="form-entry">
        <Field name={fieldName} type="text" placeholder={placeholder} className={'form-control' + (errors[fieldName] && touched[fieldName] ? ' is-invalid' : '')} />
        <ErrorMessage name={fieldName} component="div" className="invalid-feedback" />
    </div>)
}

function Links(currentUser){
    if(currentUser){
        // console.log(currentUser);
        const {nickname} = currentUser;
        return (<div className="compact-form">
            <div className="form-entry">
                <button className="form-control form-btn-down btn-sm btn-outline-primary" onClick={logout}>{`${nickname}`}-登出</button>
            </div>
        </div>)
    } else {
        return (<Formik
            initialValues={{
                username: '',
                password: ''
            }}
            validationSchema={Yup.object().shape({
                username: Yup.string().required('用户名是必须要输入的'),
                password: Yup.string().required('密码是必须要输入的')
            })}
            onSubmit={({ username, password }, { setStatus, setSubmitting }) => {
                setStatus();
                login(username, password)
                .then(user=>{console.log("logged: ", user)}, error=>{console.log("then", error); setSubmitting(false); setStatus(error);})
                .catch(error=>{console.log("catch", error)});
            }}
            render={({ errors, status, touched, isSubmitting }) => (
                <Form className="compact-form">
                    {status &&
                        <div className={'alert alert-danger login-alert'}>{status}</div>
                    }
                    {formEntry('username', '用户名', errors, touched)}
                    {formEntry('password', '密码', errors, touched)}
                    <div className="form-entry">
                        <button type="submit" className="form-control form-btn-down btn-sm btn-outline-primary" disabled={isSubmitting}>登录</button>
                    </div>
                </Form>
            )}
        />)
    }
}

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentUser: null
        };
    }

    componentDidMount() {
        console.log('did mount')
        authenticationService.currentUser.subscribe(x => this.setState({ currentUser: x }));
    }

    render() {
        const { currentUser } = this.state;
        return (
        <div>
            <nav className="navbar navbar-style navbar-default navbar-fixed-top">
                
                <a href='#' style={{float: "left"}}><span style={{letterSpacing: "-0.07em"}}>
                        Auditool 审计通
                    </span></a>               
                {Links(currentUser)}
            </nav>

        </div>
        );
    }
}