import React from 'react';
import {render} from "react-dom";
import App from './App.js';

import 'bootstrap/dist/css/bootstrap.min.css';

render(<App address={window.location.host}/>, document.getElementById('root'));
