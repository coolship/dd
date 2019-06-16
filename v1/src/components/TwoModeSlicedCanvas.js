import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactDOM from "react-dom";
//rendering tools
import _ from 'lodash';
import initREGL from 'regl';


//this container element generates an invisible canvas element which is used strictly
//to feed data to the view widgets

export default class TwoModeSlicedCanvas extends Component {
    constructor(props){
	super(props);
	this.little_canvas_ref_1 = React.createRef();
	this.little_canvas_ref_2 = React.createRef();
	this.resolution = 3000;

	//specify a margin in pixels, currently 10% on each side;
	this.margin_percent = 15;
	
	this.has_drawn_dataset=false;
    }
    componentDidMount(){
	this.little_canvases =[
	    ReactDOM.findDOMNode(this.little_canvas_ref_1.current),
	    ReactDOM.findDOMNode(this.little_canvas_ref_2.current)
	];
	this.little_regls = [];
	_.each(this.little_canvases,(e,i)=>{
	    e.width = this.resolution;
	    e.height = this.resolution;
	    this.little_regls[i] = initREGL({gl:e.getContext("webgl", {preserveDrawingBuffer:true})});
	});
	this.render_canvas = 0;
    }


    //takes as input a canvas with a transformation applied mapping x, y ranges
    //to the desired drawing area

    getRenderCanvas(){
	return this.little_canvases[this.render_canvas];
    }
    
    getRenderRegl(){
	return this.little_regls[this.render_canvas];
    }

    getStorageCanvas(){
	return this.little_canvases[1-this.render_canvas];
    }
    exchangeBuffers(){
	this.render_canvas = 1  - this.render_canvas;
    }

    //returns the length of the largest dimension of the data window
    getBackendDataLen(x0,y0,x1,y1){
	return Math.max(x1 - x0, y1 - y0);
    }

    //returns the len fo the largest data dimension + 2 * margin
    getBackendFullLen(len){
	return  (1+ 2*this.margin_percent/100) * len;
    }
    getRescale(x0,y0,len){
	return 1 / ( (1+ 2*this.margin_percent/100) * len);
    }
    getBackendOriginY(x0,y0,len){
	return y0 - this.margin_percent / 100 * 1* len;
    }

    getBackendOriginX(x0,y0,len){
	return x0 - this.margin_percent / 100 * 1* len;
    }
    renderImage(x0, y0, x1, y1, width, height){


	var dataLen = this.getBackendDataLen(x0,y0,x1,y1);
	var rescale = this.getRescale(x0,y0,dataLen);
	var inc = 1000;
	var passes = Math.ceil(this.props.getSliceTotalLength() / inc);
	var i = 0;
	this.nextPass=null;
	var that = this;


	
	var timeoutFun =function(){
	    that.nextPass=null;

	    if(i==0){
		that.getRenderRegl().clear({
		    color: [0, 0, 0, 0],
		    depth: 1,
		});
	    }
	    
	    // that.drawRegl(that.getRenderRegl(),
		// 	  rescale,
		// 	  that.getBackendOriginX(x0,y0,dataLen),
		// 	  that.getBackendOriginY(x0,y0,dataLen),
		// 	  that.props.dataset.getR(that.props.color_config).slice(i*inc,(i+1)*inc),
		// 	  that.props.dataset.getG(that.props.color_config).slice(i*inc,(i+1)*inc),
		// 	  that.props.dataset.getB(that.props.color_config).slice(i*inc,(i+1)*inc),
		// 	  that.props.dataset.getA(that.props.color_config).slice(i*inc,(i+1)*inc),
		// 	  that.props.dataset.getX().slice(i*inc,(i+1)*inc),
		// 	  that.props.dataset.getY().slice(i*inc,(i+1)*inc),
		// 	  that.props.dataset.getZ().slice(i*inc,(i+1)*inc),
		// 	 );


		if(that.props.sliceReady() && i == 0){
            console.log("slicing", i)

			const {R,G,B,A,X,Y,Z} = that.props.slicer(i*inc,(i+1)*inc)
			that.drawRegl(
				that.getRenderRegl(),
				rescale,
				that.getBackendOriginX(x0,y0,dataLen),
				that.getBackendOriginY(x0,y0,dataLen),
				R,G,B,A,X,Y,Z,
				3
			)
		}
		

		

	     i++;
	   	    
	    
	    if(i < passes){
            console.log("PASSING!")
		 that.nextPass = window.setTimeout(timeoutFun,0);
	     } else {
		that.has_drawn_dataset=true;
		window.setTimeout(function(){
		that.last_draw_params = {lx0:x0,
					 ly0:y0,
					 lr:rescale,
                     lDataLen:dataLen,
                     last_slice_time:that.props.getLastSliceTime()};
        that.exchangeBuffers();
        console.log("marking fresh from slicer...");		
		that.props.markFresh();
		    that.releaseOrResetCooldown();
		},0);
	    }
	}
	this.nextPass = window.setTimeout(timeoutFun,0);
    }
    releaseOrResetCooldown(){
	var cooldown_time = 100
	//set a cooldown which will trigger the same async render
	this.cooldown = window.setTimeout( ()=>{
	    if(this.needs_render){
		//delayed async render does not delete the cooldown
		var {x0,x1,y0,y1,width,height} = this.next_render;
		this.renderImage(x0,y0,x1,y1,width,height);
		
		//only removes needs_render flag
		this.needs_render=false;
	    } else {
		this.cooldown=null;
	    }
	}, cooldown_time);
    }
    
    getImage(x0, y0, x1, y1, width, height, block_render){


	var clientDim = Math.max(width,height);
	var output_canvas = document.createElement("canvas");
	output_canvas.width = clientDim;
	output_canvas.height = clientDim;	
    var output_context = output_canvas.getContext("2d");
    
    var {lx0, ly0, lr, lDataLen,last_slice_time} = this.last_draw_params?this.last_draw_params:{};
    console.log("SLICE TIMES COMPARISON: ", last_slice_time, this.props.getLastSliceTime())
    
	var nDataLen = this.getBackendDataLen(x0,y0,x1,y1);
	var nFullLen = this.getBackendFullLen(nDataLen);
	var rescale = this.getRescale(x0,y0,nDataLen);
	var max_delta;
    var has_moved = false;
    var has_sliced = false;

	if(this.has_drawn_dataset){
	    var center_motion_x = Math.abs(( lx0 + lDataLen / 2) - (x0 + nDataLen /2));
	    var center_motion_y = Math.abs(( ly0 + lDataLen / 2) - (y0 + nDataLen / 2));
	    var change_width = Math.abs(nDataLen - lDataLen);
	    var delta = 0;
	    max_delta = Math.max(center_motion_x,center_motion_y,change_width);
        has_moved = (center_motion_x > delta || center_motion_y > delta || change_width > delta);
        if(this.props.getLastSliceTime() != last_slice_time ){
            has_sliced = true
        }
    } else {
	    max_delta = -1;
	    has_moved = true;
	}


	//do not render if we haven't moved, or if render is explicitly blocked
    var do_render = (has_moved || has_sliced) && !block_render;
	if(do_render){	    
	    if(this.cooldown==null){
		//if not in cooldown state, trigger an async render
		this.cooldown=window.setTimeout(()=>{this.renderImage(x0,y0,x1,y1,width,height);},0);
		
	    }else{
		this.needs_render = true;
		this.next_render = {x0,y0,x1,y1,width,height};
				    
	    }
	}

	var littleCanvas = this.getStorageCanvas();
	var buffer_resolution = this.resolution; 
	var scl = buffer_resolution / clientDim;
	

	output_context.beginPath();
	output_context.clearRect(-5000,-5000,10000,10000);
	var source_x0 = this.getBackendOriginX(lx0,ly0,lDataLen);
	var source_y0 = this.getBackendOriginY(lx0,ly0,lDataLen);
	var outputLen = clientDim * (1+ this.margin_percent/100 * 2) ;
	var marginOffset = outputLen * this.margin_percent/100;
	var lMarginData = lDataLen * this.margin_percent/100;
    
	output_context.drawImage(littleCanvas,
				 0,
				 0,
				 this.resolution,
				 this.resolution,
				 (source_x0 -x0) * clientDim / (nDataLen),
				 (source_y0 -y0) * clientDim / (nDataLen),
				 outputLen*lDataLen/nDataLen ,
				 outputLen*lDataLen/nDataLen );
	   
	return output_canvas;
    }

    drawRegl(regl_object, zoom, cx, cy, r,g,b,a,x,y,z,size){	
	const drawDots = {
	    blend: {
		enable: true,
		func: {
		    srcRGB: 'src alpha',
		    srcAlpha: 'src alpha saturate',
		    dstRGB: 'one minus src alpha',
		    dstAlpha: 'dst alpha',
		    // src: 'one',
		    // dst: 'one'
		},
		equation: 'add',
		color: [0, 0, 0, 0]
	    },

	    vert:`precision mediump float;
	    attribute float x;
	    attribute float y;
	    attribute float z;
attribute float r;
attribute float g;
attribute float b;
attribute float a;
	    uniform float pointWidth;
	    uniform float rescale;
	    varying vec4 fragColor;
	    attribute vec4 color;
	    uniform float data_rescale;
	    uniform float cx;
	    uniform float cy;

	    vec3 normalizeCoords() {
		// read in the positions into x and y vars
		return vec3(
		    2.0*( (x-cx) *  rescale - .5),
			-2.0*(( (y-cy) *  rescale) - .5),
		    z
		);	
	    }
	    
	    void main () {
		gl_PointSize = pointWidth;
		gl_Position = vec4(normalizeCoords(), 1);
		fragColor=vec4(r, g, b, a);
	    }`,
	    frag:` precision mediump float;
	    varying vec4 fragColor;
	    void main () {
   float r = 0.0, delta = 0.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }
    gl_FragColor = fragColor;
	    }
	    `,
	    // attributes
	    attributes: {
		x: function(context, props) {
		    return props.x;
		},
		y: function(context, props) {
		    return props.y;
		},
		z: function(context, props) {
		    return props.z;
		},
		r: function(context, props) {
		    return props.r;
		},
		g: function(context, props) {
		    return props.g;
		},
		b: function(context, props) {
		    return props.b;
		},
		a: function(context, props) {
		    return props.a;
		},

	    },
	    uniforms: {
		rescale:(context,props)=>props.rescale,
		cy:(context,props)=>props.cy,
		cx:(context,props)=>props.cx,
		pointWidth: (context,props) =>props.pointWidth,
	    },
	    // vertex count
	    count:(context, props)=>props.x.length,
	    primitive: 'points'
	};

	let size_mult = size?size:1;
	regl_object(drawDots)({
	    x:x,
	    y:y,
	    z:z,
	    r:r,
	    g:g,
	    b:b,
	    a:a,
	    rescale:zoom,
	    pointWidth:50*zoom*this.resolution/1200*size_mult,
	    cx:cx,
	    cy:cy,
	});

	
    }


    render(){
	var testLittleStyles = {
	    position:"fixed",
	    display:"none",
	};
	return (
		<div>
		<canvas ref={this.little_canvas_ref_1} style={testLittleStyles}/>
		<canvas ref={this.little_canvas_ref_2} style={testLittleStyles}/>
		</div>
	);
    }



}



