//rendering tools
import _ from 'lodash';

// import as a ES module
import kdbush from 'kdbush';


//helper function to create legacy "points" property
const makePointsFromUmis = (umis)=>{
    return _.map(umis,(u)=>u.asPoint());
};


const default_types = {"-1":{
        "color":[255,255,255,.25],
    "size":1, //ACTB
    name:"ACTB",
    
    },"0":{
        "color":[255,255,255,1],
        "size":1, //GAPDH --opaque white
	"name":"GAPDH",
    },"1":{
        "color":[0,255,0,.7],
        "size":1, // GFP
	"name":"GFP",
    },"2":{
        "color":[255,0,0,.7],
        "size":1, // RFP
	"name":"RFP"
    }};


const makeUmis = (json, sequences = null)=>{
    var l = json.length;
    var umis = _.map(json,
		    function(e,i){
			var t = default_types[Math.floor(e[0])];
			var color = t&&t.color?t.color:[255,255,255,1];
			var size = t&&t.size?t.size:1;
			var z = (1-i/l);
			var seq = sequences?sequences[i]:null;
			
			const u = {x:e[1],
				   y:e[2],
				   type:e[0],
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
    typeName(){
	return default_types[this.type].name;
    }
}



export class Dataset{
    constructor(name, coordinate_data,annotations_url){

	this.annotation_promise = null;
	this.annotations_url = annotations_url;
	this.coordinate_data = coordinate_data;
	this.name = name;
	this.annotations = null;
	this.sequences = null;
	this.fetchAnnotations();



	

    }

    
    async initializeAsync(statusCallback, completionCallback, config){
		
	function resolveAfter0Seconds() {
	    return new Promise(resolve => {
		setTimeout(() => {
		    resolve('resolved');
		}, 0);
	    });
	}

	function breakFromThread(callback) {
	    return resolveAfter0Seconds().then(function() {
		return callback();
	    });
	}
	
	statusCallback(0,"initializing umi data");
	this.umis = await breakFromThread(()=>makeUmis(this.coordinate_data,this.sequences));
	statusCallback(20,"initializing point geometry");
	this.points = await breakFromThread(()=>makePointsFromUmis(this.umis));
	statusCallback(40,"initializing coordinates");
	var coord_data = this.umis.map(function(e,i){return [e.x,e.y];});
	
	statusCallback(50,"sorting with kdbush");
	this.kd = await breakFromThread(function(){return kdbush(coord_data)});
	
	
	statusCallback(60, "buffering color data");
	await breakFromThread(this.makeColorBuffers.bind(this));

	statusCallback(70, "fetching segmentation annotation");
	await this.annotation_promise;
	await breakFromThread(this.makeColorBuffersFromCells.bind(this));
	
	statusCallback(90, "buffering coordinate data")
	await breakFromThread(this.makeCoordBuffers.bind(this));
	
	statusCallback(100,"initialized dataset");
	completionCallback();

    }
    
    initializeSync(){
	this.umis = makeUmis(this.coordinate_data,this.sequences);
	this.points = makePointsFromUmis(this.umis);
	var coord_data = this.umis.map(function(e,i){return [e.x,e.y];});
	this.kd = kdbush(coord_data);
	this.makeColorBuffers();
	this.makeCoordBuffers();
    }

  
    getSubset(x0,y0,x1,y1){ /*returns a Dataset from a range of this current dataset*/
	var idxs = this.kd.range(x0,y0,x1,y1);
	var coords = idxs.map((e)=>this.coordinate_data[e]);
	const ds = new Dataset(this.name+"_subs"+[x0,y0,x1,y1].join("_"),coords,null);
	ds.initializeSync();
	return ds;
    }

    getR({by_segment}){ return by_segment?this.r_seg:this.r;}
    getG({by_segment}){ return by_segment?this.g_seg:this.g;}
    getB({by_segment}){ return by_segment?this.b_seg:this.b;}
    getA({by_segment}){ return by_segment?this.a_seg:this.a;}
    
    makeColorBuffers(){
	this.r = Float32Array.from(this.points.map((p)=>p.color[0]));
	this.g = Float32Array.from(this.points.map((p)=>p.color[1]));
	this.b = Float32Array.from(this.points.map((p)=>p.color[2]));
	this.a = Float32Array.from(this.points.map((p)=>p.color[3]));
    }

    makeColorBuffersFromCells(){

	if(!this.segments){throw "no cell segments defined";}
	const max_segment = this.segments.reduce((next,curr)=>{return Math.max(next,curr)});

	var seed = 1;
	function seeded_random() {
	    var x = Math.sin(seed++) * 10000;
	    return x - Math.floor(x);
	}
	
	const colors = _.map(_.range(max_segment+1),(i)=>[(seeded_random()),
							  (seeded_random()),
							  (seeded_random())]);
	this.r_seg = Float32Array.from(this.segments.map((p)=>colors[p][0] ));
	this.g_seg = Float32Array.from(this.segments.map((p)=>colors[p][1] ));
	this.b_seg = Float32Array.from(this.segments.map((p)=>colors[p][2] ));
	this.a_seg = Float32Array.from(this.segments.map((p)=>.5 ));
    }
    
    makeCoordBuffers(){

	this.x = Float32Array.from(this.points.map((p)=>p.x));
	this.y = Float32Array.from(this.points.map((p)=>p.y));
	this.z = Float32Array.from(this.points.map((p)=>p.z));		
    }
    
    fetchAnnotations(){ 
	var ann_url = this.annotations_url;
	var that = this;
	this.annotation_promise = fetch(this.annotations_url).then(function(response){
	    return response.json();
	}).then(function(myJson){
	    that.annotations = myJson;
	    var seq_col = that.annotations.feature_cols.indexOf("seq");
	    that.sequences = that.annotations["features"].map((e)=>e[seq_col]);
	    _.each(that.umis,function(e,i){
		e.seq = that.sequences[i];
	    });

	    var seg_col = that.annotations.feature_cols.indexOf("seg");
	    that.segments = that.annotations["features"].map((e)=>e[seg_col]);
	    _.each(that.umis,function(e,i){
		e.seg = that.segments[i];
	    });
	    
	    that.points = makePointsFromUmis(that.umis);
	});
    }

    idxs_by_segment(segment){
	if(!this.segments_dict){
	    this.segments_dict = {};
	    _.each(this.segments,(e,i)=>{
		if(!this.segments_dict[e]){ this.segments_dict[e] = [];}
		this.segments_dict[e].push(i);		
	    });
	}
	return this.segments_dict[segment];
    }
    
    within(x,y,radius){
	return this.kd.within(x,y,radius).map(idx=>this.umis[idx]);
    }

    idxs_within(x,y,radius){
	return this.kd.within(x,y,radius);
    }

    range(x0,y0,x1,y1){
	return this.kd.range(x0,y0,x1,y1).map(idx=>this.umis[idx]);
    }

    nearest(x,y,radius){
	var umis = this.within(x,y,radius);
	if (umis.length <1){
	    return null; }
	return umis.reduce(function(current,next_umi){
	    var d =  (next_umi.x - x)**2 + (next_umi.y -y)**2 ;
	    if(!current || d <current.d){
		return {d:d,u:next_umi};
	    } else{
		return current;
	    }
	},{u:undefined,d:Infinity})["u"];
    }

    
}

