import React from 'react';
import BookManagerComp from './BookManagerComp';

import styled from 'styled-components';

const Header = styled.div`
    font-size: 2em;
`

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
        <div>
            <nav className="navbar-style">
                <Header style={{letterSpacing: "-0.07em"}}>Auditool 审计通</Header>
            </nav>

            <BookManagerComp/>

        </div>
        );
    }
}