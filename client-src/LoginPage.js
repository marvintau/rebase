import io from 'socket.io-client';
import React from 'react';
import { Button, Form, FormGroup, Label, Col, UncontrolledAlert, Input} from 'reactstrap';
import {Navbar, NavbarBrand} from 'reactstrap';


export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            registering: false,
            username: '',
            usernameValid : false,
            password: '',
            passtwice: '',
            nickname: '',
            submitted: false,
            loading: false,
            error: ''
        };
    }

    componentDidMount(){
        this.socket = io(`${this.props.address}/AUTH`)
        .on('LOG_DONE', ({id, nickname}) => {

            localStorage.setItem('user_id', id);
            localStorage.setItem('user_nickname', nickname)

            const { from } = this.props.location.state || { from: { pathname: "/" } };
            this.props.history.push(from);
        })
        .on('LOG_NOT_FOUND', () => {
            console.log('错误');
            this.setState({error:'没登进去，您检查一下用户名或密码？', loading: false})
        })
        .on('REG_DONE', () => {
            const { from } = this.props.location.state || { from: { pathname: "/" } };
            this.props.history.push(from);
        })
        .on('REG_DUP_NAME', () => {
            console.log('重名');
            this.setState({error:'有人用了这个用户名了，换个名注册吧。', loading: false})
        })
        .on('connect_error', (err) => {
            this.setState({error:'矮油，连不到服务器了。系统需要时刻保持与服务器的连接。您先检查下网络是否正常？如果仍然无法连接，请召唤程序员。', loading: false})
        });
    }

    componentWillUnmount(){
        this.socket.close();
    }

    handleChange = (e) => {
        const { name, value } = e.target;

        let usernameValid = this.state.username.match(/^[\._a-zA-Z]+$/) !== null;

        this.setState({ [name]: value, usernameValid});
    }

    toggleRegister = (e) => {
        e.preventDefault();
        this.setState({
            registering: !this.state.registering
        })
    }

    handleSubmit =(e) => {
        e.preventDefault();

        this.setState({ submitted: true });
        const { registering, username, usernameValid, password, nickname } = this.state;

        // stop here if form is invalid
        if (registering ? !(username && usernameValid && nickname && password) : !(username && password)) {
            return;
        }

        this.setState({ loading: true });

        if(registering){
            this.socket.emit('REGISTER', {username, password, nickname});
        } else {
            this.socket.emit('LOGIN', {username, password}); 
        }
    }

    render() {
        const { registering, username, usernameValid, password, passtwice, nickname, submitted, loading, error } = this.state;

        let errorMsgElem = error ? <UncontrolledAlert color="danger">{error}</UncontrolledAlert> : [];
        console.log(errorMsgElem, usernameValid, 'valid');

        let navBar = <Navbar color="light" light expand="md">
            <NavbarBrand style={{fontWeight:'bolder', letterSpacing:'-0.08em'}}>🧐Integraudit{' - '}审计通</NavbarBrand>
        </Navbar>


        let form = <Col md={{size:'4', offset:'4'}} style={{marginTop: '100px'}}>
            <h2>{registering ? '新用户注册': '登录'}</h2>
            <Form onSubmit={this.handleSubmit}>
                <FormGroup className={submitted && !username ? ' has-error' : ''}>
                    <Label for="username">用户名</Label>
                    <Input type="text" name="username" value={username} onChange={this.handleChange} />
                    {(submitted && !username)
                        ? <div className="help-block">用户名是必填的</div>
                        : (submitted && !usernameValid)
                        ? <div className="help-block">用户名包含的字符仅限大小写英文字符，及英文的".", "-"与"_"符号</div>
                        : undefined
                    }
                </FormGroup>
                <FormGroup className={submitted && !password ? ' has-error' : ''}>
                    <Label for="password">密码</Label>
                    <Input type="password" name="password" value={password} onChange={this.handleChange} />
                    {submitted && !password &&
                        <div className="help-block">密码也是必填的</div>
                    }
                </FormGroup>
                {registering && <FormGroup className={submitted && passtwice !== password ? ' has-error' : ''}>
                    <Label for="passtwice">再次输入密码</Label>
                    <Input type="password" name="passtwice" value={passtwice} onChange={this.handleChange} />
                    {submitted && (passtwice !== password) &&
                        <div className="help-block">两次输的密码不符</div>
                    }
                </FormGroup>}
                {registering && <FormGroup>
                    <Label for="nickname">您的昵称</Label>
                    <Input type="text" className="form-control" name="nickname" value={nickname} onChange={this.handleChange} />
                    {submitted && !nickname &&
                        <div className="help-block">昵称也是不能为空的</div>
                    }
                </FormGroup>}
                <FormGroup>
                    <Button color='primary' disabled={loading}>{registering ? '注册': '登录'}</Button>
                    {loading &&
                        <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                    }
                    <Button
                        color='info'
                        disabled={loading}
                        style={{marginLeft: '10px', outline: 'none'}}
                        onClick={this.toggleRegister}
                    >{registering ? '返回登录' : '还没注册?'}</Button>
                </FormGroup>
                {errorMsgElem}
            </Form>
        </Col>

        return <div>
            {navBar}
            {form}
        </div>
    }
}