import {SET_MOUSE_XY} from "../actions/types";

const default_state={
    x:0,
    y:0
}

export default( state= default_state,  action) => {
    switch(action.type){
    case SET_MOUSE_XY:
	return Object.assign({}, state, {x:action.payload.x,
					 y:action.payload.y})
    default:
	return state;
    }
}
