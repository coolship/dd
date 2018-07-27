import { combineReducers } from "redux";

import { RESET, CLEAN_RESET_WITH_JSON, UPDATE_STATE_WITH_JSON, RESET_UI_ONLY } from "../actions/types";


//data and user reducers
import auth from "./authReducer";
import datasets from "./datasetsReducer";


//ui reducers
import app from "./appReducer";
import viewport from "./viewportReducer";
import mouse from "./mouseReducer";
import selection from "./selectionReducer";
import query from "./queryReducer";


const appReducer = combineReducers({
    auth,
    datasets,
    app,
    mouse,
    viewport,
    selection,
    query,
});


const rootReducer = (state, action) => {
    
    if (action.type === RESET) {
	state = undefined;
    } else if (action.type === CLEAN_RESET_WITH_JSON){
	state = action.payload;
    } else if (action.type === UPDATE_STATE_WITH_JSON){
	state = Object.assign({},state,action.payload);
    } else if (action.type === RESET_UI_ONLY){
	var {datasets,auth} = state;
	state = Object.assign({},{datasets:state.datasets,
				  auth:state.auth,				  
				 });
	console.log(state);
    }

    return appReducer(state, action);
};

export default rootReducer;
