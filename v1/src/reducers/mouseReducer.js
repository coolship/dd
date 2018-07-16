import {SET_MOUSE_XY} from "../actions/types";

const default_state={
    nx:0,
    ny:0
}

export default( state= default_state,  action) => {
    switch(action.type){
    case SET_MOUSE_XY:
	return Object.assign({}, state, {nx:action.payload.nx,
					 ny:action.payload.ny})
    default:
	return state;
    }
}
