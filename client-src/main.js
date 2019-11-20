import React from 'react';
import ReactDOM from "react-dom";
import App from './App.js';

ReactDOM.render(<App address={window.location.host}/>, document.getElementById('root'));
