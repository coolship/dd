import {SET_QUERY_UMI_SUBSTRING, SET_QUERY_UMI_TYPE} from "../actions/types";

const default_state={
    umi_substring:null,
    umi_type:null,
}

export default( state= default_state,  action) => {
    switch(action.type){
    case SET_QUERY_UMI_SUBSTRING:
	return Object.assign({}, state, {umi_substring:action.payload})
    case SET_QUERY_UMI_TYPE:
	return Object.assign({}, state, {umi_type:action.payload})
    default:
	return state;
    }
}
