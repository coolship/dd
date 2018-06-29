import { SET_COLORMAP, SET_POINTSIZE } from "../actions/types";

export default (state = { pointsize:10,
			  colormap:{
			      "-1":[255,255,255,1],
			      "0":[0,0,255,1],
			      "1":[255,0,0,1],
			      "2":[0,255,0,1]
			  }}
		, action) => {

    switch (action.type) {
    case SET_COLORMAP:
	return  Object.assign({}, state, {
            colormap: action.payload
	})
    case SET_POINTSIZE:
	return Object.assign({},state, {
	    pointsize:action.payload
	})
    default:
	return state;
    }
		    
};
