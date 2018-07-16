import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactDOM from "react-dom";


//rendering tools
import _ from 'lodash';
import initREGL from 'regl';




//this container element generates an invisible canvas element which is used strictly
//to feed data to the view widgets

class TwoModeCanvas extends Component {
    constructor(props){
	super(props);
	this.big_canvas_ref = React.createRef();
	this.little_canvas_ref = React.createRef();
    }
    componentDidMount(){

	this.big_canvas = ReactDOM.findDOMNode(this.big_canvas_ref.current );
	this.big_context = this.big_canvas.getContext("webgl", {preserveDrawingBuffer:true});
	this.big_canvas.width=10000;
	this.big_canvas.height=10000;


	this.little_canvas = ReactDOM.findDOMNode(this.little_canvas_ref.current);
	this.little_context = this.little_canvas.getContext("webgl", {preserveDrawingBuffer:true});
	this.little_canvas.width=1200;
	this.little_canvas.height=1200;
	this.big_regl = initREGL({gl:this.big_context});	
	this.little_regl = initREGL({gl:this.little_context});		
    }

    computePositions(x0,y0,x1,y1){

	    
	    var points_unfiltered = this.props.dataset.current_dataset.tree.search(
		{minX:x0,
		 maxX:x1,
		 minY:y0,
		 maxY:y1,
		});

	    var points;

	    console.time("free stuff")
	    
	    if(this.props.query.umi_substring){
		var subs_re = RegExp(this.props.query.umi_substring.toUpperCase());
		var umis_data = this.props.dataset.umis_json;
		points = _.filter(points_unfiltered,
				  function(e){
				      return subs_re.exec(umis_data[e.idx].sequence) != null;
				  });
	    } else {
		points = points_unfiltered;
	    }
	    console.timeEnd("free stuff");

	    console.time("pos")
	    
	    this.positions = _.map(points,(p)=>{return {x:p.minX,
						       y:p.minY,
						       z:.5};});

	

	    console.timeEnd("pos")

	
    }

    //takes as input a canvas with a transformation applied mapping x, y ranges
    //to the desired drawing area
    getCanvasImage(x0, y0, x1, y1, width, height){

	//var {a,b,c,d,e,f} = this.props.app.transform;
	var use_big = Math.max(x1-x0,y1-y0) > 5000;

	var output_canvas = document.createElement("canvas");
	output_canvas.width = width;
	output_canvas.height = height;	
	var output_context = output_canvas.getContext("2d");
	
	if (use_big){

	    
	} else {
	    if (!this.props.dataset.current_dataset)
	    {
		console.log("no dataset yet. not drawing")
		return
		
	    }

	    

	    console.time("full_render")

	    var points_unfiltered = this.props.dataset.current_dataset.tree.search(
		{minX:x0,
		 maxX:x1,
		 minY:y0,
		 maxY:y1,
		});

	    var points;

	    console.time("free stuff")
	    
	    if(this.props.query.umi_substring){
		var subs_re = RegExp(this.props.query.umi_substring.toUpperCase());
		var umis_data = this.props.dataset.umis_json;
		points = _.filter(points_unfiltered,
				  function(e){
				      return subs_re.exec(umis_data[e.idx].sequence) != null;
				  });
	    } else {
		points = points_unfiltered;
	    }
	    console.timeEnd("free stuff");
	    
	    console.time("regl")
	    var buffer_resolution = this.little_canvas.width; 
	    var rescale = 1/(x1 - x0);    
	    this.drawRegl(this.little_regl,
			  rescale,
			  x0,
			  y0,
			  points.slice(0,500000));
	    
	    console.timeEnd("regl")

	    var scl = buffer_resolution / Math.max(height, width);
	    //var y_ofs = height < width?(width - height) / 2: 0; // not used, why?
	    //var x_ofs = width < height?(height - width ) / 2: 0; // not used, why?
	    
	    output_context.drawImage(this.little_canvas,
				     0,
				     0,
				     width*scl,
				     height*scl,
				     0,
				     0,
				     width,
				     height);

	    console.timeEnd("full_render")
	    
	
	}
	return output_canvas;
    }


    
    drawRegl(regl_object, zoom, cx, cy, points){	
	const drawDots = {
	    blend: {
		enable: true,
		func: {
		    srcRGB:   'src alpha',
		    srcAlpha: 'src alpha',
		    dstRGB:   'one minus src alpha',
		    dstAlpha: 'one minus src alpha'
		},
		equation: {
		    rgb: 'add',
		    alpha: 'add'
		},
		color: [0, 0, 0, 0]
	    },
	    vert:`precision mediump float;
	    attribute vec3 position;
	    attribute float pointWidth;
	    uniform float rescale;
	    varying vec4 fragColor;
	    attribute vec4 color;
	    uniform float data_rescale;
	    uniform float cx;
	    uniform float cy;

	    vec3 normalizeCoords(vec3 position) {
		// read in the positions into x and y vars
		float x = position[0];
		float y = position[1];
		float z = position[2];
		return vec3(
		    2.0*( (x-cx) *  rescale - .5),
			-2.0*(( (y-cy) *  rescale) - .5),
		    z
		);	
	    }
	    
	    void main () {
		gl_PointSize = pointWidth;
		gl_Position = vec4(normalizeCoords(position), 1);
		fragColor=color;
	    }`,
	    frag:` precision mediump float;
	    varying vec4 fragColor;
	    void main () {
		float r = 0.0, delta = 0.0, alpha = 1.0;
		vec2 cxy = 2.0 * gl_PointCoord - 1.0;
		r = dot(cxy, cxy);
		if (r > 1.0) {discard;}
		gl_FragColor = fragColor * alpha;
	    }
	    `,
	    // attributes
	    attributes: {
		position: function(context, props) {
		    return props.points.map(function(point) {
			return [point.minX, point.minY, point.z];
		    });
		},
		pointWidth: function(context, props) {
		    return  props.points.map(function(point) {
			return point.size;
		    });
		},
		color:(context,props)=>props.points.map(d => d.color),
		
	    },
	    uniforms: {
		rescale:(context,props)=>props.rescale,
		cy:(context,props)=>props.cy,
		cx:(context,props)=>props.cx,
	    },
	    // vertex count
	    count:(context, props)=>props.points.length,
	    primitive: 'points'
	};


	
	regl_object.clear({
	    color: [0, 0, 0, 1],
	    depth: 1,
	});
	regl_object(drawDots)({
	    points: points,
	    rescale:zoom,
	    cx:cx,
	    cy:cy,
	});

	
    }


    render(){


	var testLittleStyles = {
	    backgroundColor:"red",
	    position:"fixed",
	    zIndex:100,
	     display:"none",
	}


	var testBigStyles = {
	    display:"none",
	}
	
	return (
		<div>
		<canvas ref={this.little_canvas_ref} style={testLittleStyles}/>
		<canvas ref={this.big_canvas_ref} style={testBigStyles}/>
		</div>
	)
    }



}





function mapStateToProps( { dataset, viewport, query, selection} ) {
    return { dataset, viewport, query, selection};
}



export default connect(mapStateToProps, {}, null, { withRef: true })(TwoModeCanvas)
