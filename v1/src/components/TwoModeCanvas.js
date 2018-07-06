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

	super(props)
	this.big_canvas_ref = React.createRef()
	this.little_canvas_ref = React.createRef()
	

    }


    componentDidMount(){

	this.big_canvas = ReactDOM.findDOMNode(this.big_canvas_ref.current )
	this.big_context = this.big_canvas.getContext("webgl", {preserveDrawingBuffer:true})
	this.big_canvas.width=10000;
	this.big_canvas.height=10000;


	this.little_canvas = ReactDOM.findDOMNode(this.little_canvas_ref.current)
	this.little_context = this.little_canvas.getContext("webgl", {preserveDrawingBuffer:true})
	this.little_canvas.width=1200;
	this.little_canvas.height=1200;
	this.big_regl =  initREGL({
	    gl:this.big_context,
	})	

	this.little_regl =  initREGL({
	    gl:this.little_context,
	})		
    }
    
    //takes as input a canvas with a transformation applied mapping x, y ranges
    //to the desired drawing area
    renderToContext(context2d, x0, x1, y0, y1){

	var {a,b,c,d,e,f} = this.props.app.transform;
	var use_big = Math.max(x1-x0,y1-y0) > 5000;


	
	if (use_big){
		/*
	    throw "big mode not yet implemented"
	    var source_scale = 1 / this.props.backend.scale_factor
	    var {a,b,c,d,e,f} = this.props.app.transform;	
	    child_context.transform(a,b,c,d,e,f)
	    child_context.transform(source_scale,0,0,source_scale,0,0)
	    child_context.transform(1,0,0,1,
				    -this.props.big_canvas.width/2,
				    -this.props.big_canvas.height/2)

	    var lz = Math.floor(Math.log10(this.props.app.transform.a))
	    var active_backend = this.backends[[lz]]
	    var source_canvas = active_backend.canvas
	    child_context.drawImage(source_canvas,0,0)
*/

	    
	} else {
	    if (!this.props.dataset.current_dataset)
	    {
		console.log("no dataset yet. not drawing")
		return
		
	    }
	    
	    var zoom = this.props.app.transform.a

	    
	    var points = this.props.dataset.current_dataset.tree.search(
		{minX:x0,
		 maxX:x1,
		 minY:y0,
		 maxY:y1,
		})

	    var positions = _.map(points,(p)=>{return {x:p.minX,
						       y:p.minY,
						       z:.5}})
	   
	    var appearances = _.map(points,(p)=>{return {
		size:5,
		color:[255,255,255,1]
	    }})

	    var buffer_resolution = this.little_canvas.width;  /// ( x1 - x0) / zoom  / 2
	    this.drawRegl(this.little_regl,
			  buffer_resolution/2, //rescale factor
			  zoom,
			  (x0+x1) /2,
			  (y0+y1) /2,
			  positions,
			  appearances)
	    
	    //context2d.transform(this.props.app.transform.a,0,0,this.props.app.transform.d,0,0)


	   
	    //context2d.transform(this.props.app.transform.a,0,0,
	//			this.props.app.transform.d,0,0)
				//this.props.app.transform.e,
				//this.props.app.transform.f)



	    context2d.transform( 1/buffer_resolution/zoom,
				0,0,
				 1/buffer_resolution/zoom,
				0,0) //-this.little_canvas.width/2,-this.little_canvas.width/2)
	    
	    context2d.drawImage(this.little_canvas,
				-1 * buffer_resolution / 2, -1* buffer_resolution/2,
				//x0,y0,
				//x1 - x0,
				//y1 - y0,
			       )
	}	
    }


    
    drawRegl(regl_object, resolution, zoom, cx, cy, points, appearances){	
	//takes points in universal coordinates and maps them to scaled coordinates
	//having the range 0 to 1
	//rescale should be equal to 1 / (   (output_width / zoom / 2)   ) 

	const drawDots = {
	    //NOTE: THESE CONTROLS ONLY SEEM TO WORK IN THE DATA URL PNG.
	    //NICE!!

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
	    uniform float resolution;
	    uniform float zoom;
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
		    (x-cx) / resolution * zoom,
		    -1.0*(y-cy) / resolution * zoom,
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
		vec2 cxy = gl_PointCoord;
		r = dot(cxy, cxy);
		if (r > 1.0) {
		    discard;
		}
		gl_FragColor = fragColor * alpha;

	    }
	    `,
	    // attributes
	    attributes: {
		position: function(context, props) {
		    return props.points.map(function(point) {
			return [point.x, point.y, point.z]
		    });
		},
		pointWidth: function(context, props) {
		    return  props.appearances.map(function(point) {
			return point.size;
		    });
		},
		color:function(context,props){
		    return props.appearances.map(d => d.color)
		}
		
	    },
	    uniforms: {
		resolution:function(context,props){return props.resolution},
		zoom:function(context,props){return props.zoom},
		cy:function(context,props){return props.cy},
		cx:function(context,props){return props.cx},
	    },
	    // vertex count
	    count: function(context, props) {
		// set the count based on the number of points we have
		return props.points.length
	    },
	    primitive: 'points'
	};


	
	regl_object.clear({
	    color: [0, 0,255, 1],
	    depth: 1,
	});
	regl_object(drawDots)({
	    points: points,
	    appearances: appearances,
	    resolution:resolution,
	    zoom:zoom,
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





function mapStateToProps( { dataset, app, view } ) {
    return { dataset, app, view};
}



export default connect(mapStateToProps, {}, null, { withRef: true })(TwoModeCanvas)
