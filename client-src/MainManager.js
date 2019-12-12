import React from 'react';

import ProjectNavigator from './ProjectNavigator';
import TableManager from './TableManager';

import {Navbar, NavbarBrand, Button} from 'reactstrap';

const loggerStyle = {    
    whiteSpace: 'pre-wrap',
    margin: '10px',
    fontSize: '80%',
    lineHeight: '2em',
    height: '250px',
}


// MainManager holds the Navbar for logging information, and manages the navigation status.
// The status could be:
// 1) selecting-project:
//    fetch and render the project list as a sortable and findable table.
//    it also need to render the buttons, including create new project.
//    by clicking the create project button, the table disappears, form is rendered.
//    So this part should be wrapped within a "Project list manager"
// 
// 2) managing-table
//    after navigated into the project, you will see a cascaded table with different entries.
//    there will be no file-extension selection, but for each kind of table, there will be a
//    corresponding button to upload file.
// 

export default class MainManager extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            logs: [],
            stage: 'selecting-project',
        }

    }

    logout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_nickname');
        
        location.reload(true);
    }

    navigateToProject = (projName) => {
        this.setState({
            selectedProject: projName,
            stage: 'managing-table'
        });
    }

    backToProjectList = () => {
        this.setState({
            selectedProject: undefined,
            stage:'selecting-project'
        })
    }

    render(){

        let navBar = <Navbar color="light" light expand="md">
            <NavbarBrand style={{fontWeight:'bolder', letterSpacing:'-0.08em'}}>🧐Integraudit{' - '}审计通</NavbarBrand>
            <div className="ml-auto">
                <span className="navbar navbar-text">你好, {localStorage.getItem('user_nickname')}</span>
                <Button color="primary" onClick={this.logout}>登出</Button>
            </div>
        </Navbar>

        let content,
            {address} = this.props,
            {stage, selectedProject} = this.state;

        switch(stage){
            case 'selecting-project' :
                content = <ProjectNavigator
                    address={address}
                    navigateToProject={this.navigateToProject}
                />;
                break;
            case 'managing-table':
                content = <div style={{margin: '10px'}}>
                    <TableManager
                        address={address}
                        projName={selectedProject}
                        backToProjectList={this.backToProjectList}
                    />
                </div>;
                break;
        }

        return <div>
            {navBar}
            {content}
        </div>

    }
}