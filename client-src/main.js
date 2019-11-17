import React from 'react';
import {render} from "react-dom";
import App from './App.js';

const address = 'http://localhost:8080';

render(<App address={address}/>, document.getElementById('root'));
