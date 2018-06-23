import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {GoogleAPI,GoogleLogin,GoogleLogout} from 'react-google-oauth'
import registerServiceWorker from './registerServiceWorker';




ReactDOM.render(
	<App/>
	, document.getElementById('root'));
registerServiceWorker();
