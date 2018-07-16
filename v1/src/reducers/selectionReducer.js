import {SET_SELECT_TYPE, SET_SELECT_UMI_IDX} from "../actions/types";

export default (state={select_umi_idx:-1,select_type:-1},action) =>
    {
	switch(action.type){
	case SET_SELECT_UMI_IDX:
	    return Object.assign({},state, {
		select_umi_idx:action.payload
	    });
	case SET_SELECT_TYPE:
	    return Object.assign({},state, {
		select_type:action.payload
	    });
	default:
	    return state;
	}
    }

	  
