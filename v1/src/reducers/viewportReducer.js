import {SET_VIEWPORT_WH} from "../actions/types";

const default_state={
    width:null,
    height:null,
}

export default( state= default_state,  action) => {
    switch(action.type){
    case SET_VIEWPORT_WH:
	return Object.assign({}, state, {width:action.payload.width,
					 height:action.payload.height})
    default:
	return state;
    }
}
