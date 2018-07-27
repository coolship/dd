//rendering tools
import _ from 'lodash';
import {makeTreeFromUmis} from "./TreeFuns";

//helper function to create legacy "points" property
const makePointsFromUmis = (umis)=>{
    return _.map(umis,(u)=>u.asPoint());
};


const makeUmis = (json,types,umis)=>{
    var umis = _.map(json,
		    function(e,i){
			var t =  types?types[Math.floor(e[1])]:null;
			var color = t&&t.color?t.color:[255,255,255,1];
			var size = t&&t.size?t.size:1;
			var z = t&&t.z?t.z:.5;
			var seq = umis?umis[i]["sequence"]:null;

			const u = {x:e[3],
				y:e[4],
				id:e[0],
				type:e[1],
				idx:i,
				seq:seq,
				  };

			var appearance = {
				z:z,
				color:color,
				size:size,
			};
			
			return new Umi(u.x,u.y,u.id,u.type,u.idx,u.seq, appearance);
		    }
		   );
    return umis;    
};



export class Umi{
    constructor(x,y,id,type,idx,seq,appearance={}){
	this.x=x;
	this.y=y;
	this.id=id;
	this.type=type;
	this.idx=idx;
	this.seq=seq;
	this.appearance=appearance;
    }

    asPoint(){
	const {x,y,id,type,idx,seq} = this;
	const {z,color,size} = this.appearance;
	return {x,y,id,type,idx,seq,z,color,size};
    }
}

export class Dataset{
    constructor(name, coordinate_data, types_data, sequence_data){
	this.name = name;
	this.umis = makeUmis(coordinate_data,
			     types_data,
			     sequence_data);
	this.tree = makeTreeFromUmis(this.umis);
	this.points = makePointsFromUmis(this.umis);
    }

    getUmisInRegion(x0,y0,x1,y1){
	return _.map(this.tree.search(
	    {minX:x0,
	     maxX:x1,
	     minY:y0,
	     maxY:y1,
	    }),(e)=>e.umi);
    }
}


export class Neighborhood{
    constructor(dataset,x0,y0,x1,y1){
	this.parent_dataset = dataset;
	
	this.x0 = x0;
	this.y0 = y0;
	this.x1 = x1;
	this.y1 = y1;

	this.umis = this.parent_dataset.getUmisInRegion(x0,y0,x1,y1);
	this.tree = makeTreeFromUmis(this.umis);
	this.points = makePointsFromUmis(this.umis);


    }
}
