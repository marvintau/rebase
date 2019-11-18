import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export default ({ component:Component, render: renderFunc, ...rest }) => (
    <Route {...rest} render={props => {

        console.log(props, 'props')
        return !localStorage.getItem('user_id')
            ? <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
            : renderFunc
            ? renderFunc(props) 
            : <Component {...props} />
    
    }} />
)