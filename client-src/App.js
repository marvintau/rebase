import React from 'react';
import BookManagerComp from './BookManagerComp';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let {address} = this.props;
        return <BookManagerComp address={address}/>;
    }
}