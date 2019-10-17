import React from 'react';
import {render} from "react-dom";
import App from './App.js';

const address = 'http://120.77.243.97:443';

render(<App address={address}/>, document.getElementById('root'));