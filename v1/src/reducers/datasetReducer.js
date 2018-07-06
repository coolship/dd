import { SET_CURRENT_DATASET } from "../actions/types";

//rendering tools
import _ from 'lodash';

//math tools
var rbush = require('rbush');
var knn = require('rbush-knn');

export default (state = {
    current_dataset:null}, action) => {
    switch (action.type) {
    case SET_CURRENT_DATASET:
	var jsondata = action.payload.json;
	var meta = action.payload.metadata;
	var tree = rbush()
	tree.load(_.map(jsondata,
			function(e,i){
			    return {minX:e[3],
				    maxX:e[3],
				    minY:e[4],
				    maxY:e[4],
				    id:e[0],
				    type:e[1],
				    idx:i,
				   }}
		       ))
	
	return  Object.assign({},state,{current_dataset:
					{json:jsondata,
					 metadata:meta,
					 tree:tree}
				       })
    default:
	return state;
    }
}
