import { SET_CURRENT_DATASET, SET_CURRENT_TYPES_JSON, SET_CURRENT_UMIS_JSON } from "../actions/types";

//rendering tools
import _ from 'lodash';

//math tools
var rbush = require('rbush');
var knn = require('rbush-knn');

function makeTree(state){

    var tree = rbush();

    var json = state.current_dataset.json;
    var types = state.types_json;
    var umis = state.umis_json;
    
    tree.load(_.map(json,
		    function(e,i){
			var t =  types?types[Math.floor(e[1])]:null;
			var color = t&&t.color?t.color:[255,255,255,1];
			var size = t&&t.size?t.size:1;
			
			return {minX:e[3],
				maxX:e[3],
				minY:e[4],
				maxY:e[4],
				z:.5,
				id:e[0],
				type:e[1],
				idx:i,
				color:color,
				size:size,
			       };
		    }
		   ));
    return tree;
    
}

export default (state = {
    current_dataset:null}, action) => {

	var prestate;
	
	switch (action.type) {
	case SET_CURRENT_DATASET:
	    
	    if(!action.payload){
		return Object.assign({},state, {current_dataset:null});
	    }
	    var jsondata = action.payload.json;
	    var meta = action.payload.metadata;
	    
	    prestate=  Object.assign({},state,{current_dataset:
					       {json:jsondata,
						name:action.payload.metadata.dataset,
						metadata:meta}
					      });
	    prestate.current_dataset.tree=makeTree(prestate);
	    
	    return prestate;
	    
	case SET_CURRENT_TYPES_JSON:
	    prestate =  Object.assign({},state,
				      {
					  types_json:action.payload
				      }
				     );
	    if(prestate.current_dataset){
		prestate.current_dataset.tree=makeTree(prestate);
	    }
	    return prestate;

	case SET_CURRENT_UMIS_JSON:
	    prestate = Object.assign({},state,
				     {
					 umis_json:action.payload
				     });
	    if(prestate.current_dataset){
		prestate.current_dataset.tree = makeTree(prestate);
	    }
	    return prestate;
	    
	default:
	    return state;
	}
    }
