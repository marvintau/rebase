import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import LoginPage from './LoginPage';

import BookManagerComp from './BookManagerComp';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {address} = this.props;
        
        return <Router>
            <div>
                <PrivateRoute exact path="/" render={(props) => (<BookManagerComp address={address} {...props} />)} />
                <Route path="/login" render={(props) =>{return <LoginPage address={address} {...props} />}} />
            </div>
        </Router>
        // return <BookManagerComp address={address} />
    }
    
}