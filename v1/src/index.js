import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";
import reducers from "./reducers";

const loadState = () => {
	try {
		const serializedState = localStorage.getItem('state');
		console.log(JSON.parse(serializedState));
		if (serializedState == null) {
			return undefined;
		} else {
			return JSON.parse(serializedState);
		}
	} catch (err) {
		console.log("error loading state");
		return undefined;
	}
}

const saveState = (state) => {
	try {
		var tosave = {auth:state.auth}

		const serializedState = JSON.stringify(tosave);
		localStorage.setItem('state', serializedState);

	} catch (err) {
		//ignore write
		console.log("error saving state");
	}
};

const store = createStore(reducers, loadState() , applyMiddleware(reduxThunk));
store.subscribe(() => {
	saveState(store.getState());
});


ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>
	, document.getElementById('root'));
registerServiceWorker();
