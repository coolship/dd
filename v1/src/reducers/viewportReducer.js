import {SET_VIEWPORT_WH, SET_VIEWPORT_TRANSFORM, SET_VIEWPORT_XY} from "../actions/types";

const default_state={
    clientWidth:null,
    clientHeight:null,
    x0:0,
    y0:0,
    zoom:20,
    
}

export default( state= default_state,  action) => {
    switch(action.type){
    case SET_VIEWPORT_WH:
	return Object.assign({}, state, {clientWidth:action.payload.clientWidth,
					 clientHeight:action.payload.clientHeight})
    case SET_VIEWPORT_TRANSFORM:
	return Object.assign({}, state, {x0:action.payload.x0,
					 y0:action.payload.y0,
					 zoom:action.payload.zoom,
					})
    case SET_VIEWPORT_XY:
	return Object.assign({}, state, {x0:action.payload.x0,
					 y0:action.payload.y0})
    default:
	return state;
    }
   
}
