import React, { Component } from 'react';
import { connect } from "react-redux";

import initREGL from 'regl';




//this container element generates an invisible canvas element which is used strictly
//to feed data to the view widgets
class BackendCanvasContainer extends Component {

    
    constructor(props){
	super(props)
	if (! props.onCanvasChanged){
	    throw "please include an onCanvasChanged method in this components' props"
	}
	this.state ={
	    drawn_dataset_name:null
	}	
	this.backend_canvas = null;
	this.backend_context = null;
    }

    //a dataset has been loaded and is now ready.
    //create and render the backend canvas
    componentWillReceiveProps(nextprops){

	//creates canvas once
	if (!this.backend_canvas){
	    this.backend_canvas = document.createElement("canvas");
	    this.backend_canvas.width = this.props.backend.resolution;
	    this.backend_canvas.height = this.props.backend.resolution;
	    this.backend_context = this.backend_canvas.getContext("webgl", { 'preserveDrawingBuffer':true})
	}	
    }
    
    shouldComponentUpdate(nextprops, nextstate){
	if (nextprops.dataset.current_dataset == null){return false}
	if (nextprops.dataset.current_dataset.metadata.dataset != this.state.drawn_dataset_name){
	    nextstate.drawn_dataset_name = nextprops.dataset.current_dataset.metadata.dataset;
	    return true
	} else {
	    return false
	}

    }

    appearancesFromData(data){
	let appearances = []
	for (var i = 0; i < data.length; i++){
	    appearances.push(
		{
		    size: 25,
		    color:this.props.view.colormap[data[i][1]]
		}
	    )
	}
	return appearances
    }
    
    pointsFromData(data){
	let points = []
	for (var i = 0; i < data.length; i++){
	    points.push(
		{x:data[i][3],
		 y:data[i][4],
		 z:1- (Number(data[i][1]) +2) / 5,
		 id:data[i][0]
		}
	    )
	}
	return points
    }

    //render an empty canvas. this is not drawn
    render (){
	if (!this.backend_context){
	    return ("")
	}
	
	var backend_canvas =this.backend_canvas;
	var backend_context = this.backend_context;	
	var cwidth = this.width;
	var cheight = this.height;
	var init_regl = initREGL({
	    gl:backend_context,
	})

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
	    varying vec4 fragColor;
	    attribute vec4 color;
	    uniform float data_rescale;
	    vec3 normalizeCoords(vec3 position) {
		// read in the positions into x and y vars
		float x = position[0];
		float y = position[1];
		float z = position[2];
		return vec3(x/resolution * data_rescale,-y/resolution * data_rescale,z);
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
		data_rescale:function(context,props){return props.data_rescale},
	    },
	    // vertex count
	    count: function(context, props) {
		// set the count based on the number of points we have
		return props.points.length
	    },
	    primitive: 'points'
	};

	
		
	init_regl.clear({
	    color: [0, 0, 0, 1],
	    depth: 1,
	});
		
	init_regl(drawDots)({
	    points: this.pointsFromData(this.props.dataset.current_dataset.json),
	    appearances: this.appearancesFromData(this.props.dataset.current_dataset.json),
	    resolution: this.props.backend.resolution,
	    data_rescale: this.props.backend.scale_factor,
	});

	
	return ("")
    }

    componentDidUpdate(){
	this.props.onCanvasChanged(this.backend_canvas)
    }

}

function mapStateToProps({dataset,backend,view}){
    return {dataset,backend,view}
}

export default connect(mapStateToProps, {})(BackendCanvasContainer)
