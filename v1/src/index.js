import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";
import reducers from "./reducers";

import { APP_DATASET , APP_MODAL } from "./actions/types";

const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

ReactDOM.render(
      <Provider store={store}>

	<App/>
	</Provider>
	, document.getElementById('root'));
registerServiceWorker();
