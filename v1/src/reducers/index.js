import { combineReducers } from "redux";

import { RESET, CLEAN_RESET_WITH_JSON, UPDATE_STATE_WITH_JSON, RESET_UI_ONLY } from "../actions/types";


//data and user reducers
import auth from "./authReducer";
import datasets from "./datasetsReducer";
import selections from "./selectionsReducer";



//ui reducers
import app from "./appReducer";
import mouse from "./mouseReducer";
import query from "./queryReducer";
import demos from "./demosReducer";


const appReducer = combineReducers({
    auth,
    datasets,
    app,
    mouse,
    query,
    demos,
    selections,
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
