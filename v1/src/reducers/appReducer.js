import { SET_WAITING_FOR_DATA, SET_FULLSCREEN , RESET_APP, SET_TRANSFORM, SET_APP_MODAL } from "../actions/types";
import { combineReducers } from "redux";



const default_state={
    transform:{a:1,b:0,c:0,d:1,e:0,f:0},
    waiting_for_data:true,
    is_fullscreen:true,
    select_umi_idx:-1,
    select_umi_type:0,
}

export default (state = default_state, action) => {
    switch (action.type) {
    case SET_TRANSFORM:
	return Object.assign({},state, {
	    transform:action.payload
	});
    case SET_WAITING_FOR_DATA:
	return Object.assign({},state, {
	    waiting_for_data:action.payload,
	    select_umi_idx:-1,
	});
    case SET_FULLSCREEN:
	return Object.assign({},state, {
	    is_fullscreen:action.payload
	});
    case RESET_APP:
	return Object.assign({},default_state);
    case SET_APP_MODAL:
	return Object.assign({},state,{modal:action.payload});
    default:
      return state;
  }
};
