
//rendering tools
import _ from 'lodash';

//math tools
var rbush = require('rbush');

export const makeTree = (json,types,umis)=>{

    var tree = rbush();
    
    tree.load(_.map(json,
		    function(e,i){
			var t =  types?types[Math.floor(e[1])]:null;
			var color = t&&t.color?t.color:[255,255,255,1];
			var size = t&&t.size?t.size:1;
			var z = t&&t.z?t.z:.5;
			
			return {x:e[3],
				minX:e[3],
				maxX:e[3],
				y:e[4],
				minY:e[4],
				maxY:e[4],
				z:z,
				id:e[0],
				type:e[1],
				idx:i,
				color:color,
				size:size,
			       };
		    }
		   ));
    return tree;
    
};

export const  makePoints = (json,types,umis)=>{
    
    var points = _.map(json,
		    function(e,i){
			var t =  types?types[Math.floor(e[1])]:null;
			var color = t&&t.color?t.color:[255,255,255,1];
			var size = t&&t.size?t.size:1;
			var z = t&&t.z?t.z:.5;

			
			return {x:e[3],
				minX:e[3],
				maxX:e[3],
				y:e[4],
				minY:e[4],
				maxY:e[4],
				z:z,
				id:e[0],
				type:e[1],
				idx:i,
				color:color,
				size:size,
			       };
		    }
		   );
    return points;
    
}

