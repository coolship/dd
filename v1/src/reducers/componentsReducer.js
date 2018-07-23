import {COMPONENTS_REGISTER_IMAGE_CONTAINER} from "../actions/types";

const default_state = {
    image_container:null
};

export default (state = default_state,action) =>{
    switch(action.type){
    case COMPONENTS_REGISTER_IMAGE_CONTAINER:
	return Object.assign({},state,{
	    image_container:action.payload,
	});
    default:   
	return state;
    }

}
