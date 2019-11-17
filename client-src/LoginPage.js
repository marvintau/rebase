import io from 'socket.io-client';
import React from 'react';

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.socket = io(`${props.address}/AUTH`)
        .on('LOG_DONE', (hash) => {
            localStorage.setItem('user', hash);
            const { from } = this.props.location.state || { from: { pathname: "/" } };
            this.props.history.push(from);
        })
        .on('LOG_NOT_FOUND', () => {
            this.setState({error:'没登进去，密码错了？', loading: false})
        })
        .on('REG_DONE', () => {
            const { from } = this.props.location.state || { from: { pathname: "/" } };
            this.props.history.push(from);
        })
        .on('REG_DUP_NAME', () => {
            this.setState({error:'重名了，换个名字吧', loading: false})
        });

        this.state = {
            registering: false,
            username: '',
            password: '',
            passtwice: '',
            submitted: false,
            loading: false,
            error: ''
        };
    }

    componentWillUnmount(){
        this.socket.close();
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
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
        const { username, password } = this.state;

        // stop here if form is invalid
        if (!(username && password)) {
            return;
        }

        this.setState({ loading: true });
        if(this.state.registering){
            this.socket.emit('REGISTER', {username, password});
        } else {
            this.socket.emit('LOGIN', {username, password}); 
        }
    }

    render() {
        const { registering, username, password, passtwice, submitted, loading, error } = this.state;
        return (
            <div className="col-md-6 col-md-offset-3">
                <h2>{registering ? '新用户注册': '登录'}</h2>
                <form name="form" onSubmit={this.handleSubmit}>
                    <div className={'form-group' + (submitted && !username ? ' has-error' : '')}>
                        <label htmlFor="username">用户名</label>
                        <input type="text" className="form-control" name="username" value={username} onChange={this.handleChange} />
                        {submitted && !username &&
                            <div className="help-block">用户名是必填的</div>
                        }
                    </div>
                    <div className={'form-group' + (submitted && !password ? ' has-error' : '')}>
                        <label htmlFor="password">密码</label>
                        <input type="password" className="form-control" name="password" value={password} onChange={this.handleChange} />
                        {submitted && !password &&
                            <div className="help-block">密码也是必填的</div>
                        }
                    </div>
                    {registering && <div className={'form-group' + (submitted && !passtwice ? ' has-error' : '')}>
                        <label htmlFor="passtwice">再次输入密码</label>
                        <input type="password" className="form-control" name="passtwice" value={passtwice} onChange={this.handleChange} />
                        {submitted && passtwices !== password &&
                            <div className="help-block">两次输的密码不符</div>
                        }
                    </div>}
                    <div className="form-group">
                        <button className="btn btn-primary" disabled={loading}>{registering ? '注册': '登录'}</button>
                        {loading &&
                            <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                        }
                        <button
                            className="btn btn-info"
                            style={{marginLeft: '10px', outline: 'none'}}
                            disabled={loading}
                            onClick={this.toggleRegister}
                        >切换至{registering ? '登录' : '注册'}</button>
                    </div>
                    {error &&
                        <div className={'alert alert-danger'}>{error}</div>
                    }
                </form>
            </div>
        );
    }
}