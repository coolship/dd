import { SET_CURRENT_DATASET } from "../actions/types";

export default (state = {
    current_dataset:null}, action) => {
    switch (action.type) {
    case SET_CURRENT_DATASET:
	return  Object.assign({},state,{current_dataset: action.payload})
    default:
	return state;
    }
}
