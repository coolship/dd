import React, { Component } from 'react';
import { connect } from "react-redux";

import initREGL from 'regl';




//this container element generates an invisible canvas element which is used strictly
//to feed data to the view widgets
export default class BackendCanvasContainer {

    
    constructor(lz,lcx,lcy,nxy = 3){

	/*
	  constructor takes
lz --> zoom level, specifying a log base 10 for the zoomed untits
lcx --> log_center_x, with the offset of the window to the left or right in log zoom units
lcy --> log_center_y, same as lcx for the vertical dimension
nxy --> the number of windows to render in each dimension. default is 3, render a grid 9 with 9 elements
	*/



	this.lcx = lcx
	this.lcy = lcy
	this.lz  = lz

	console.log("created new backend canvas with units " + lz +" (" + lcx + ", " + lcy+")")
	
	this.width = 1000 * nxy
	this.height = 1000 * nxy
	this.canvas = document.createElement("canvas")
	this.context = this.canvas.getContext("webgl", {preserveDrawingBuffer:true})
	this.canvas.width=this.width;
	this.canvas.height=this.height;

	this.regl =  initREGL({
	    gl:this.context,
	})	
		


	
	
    }

    clearData(){
	this.regl.clear({
	    color: [0, 0, 0, 1],
	    depth: 1,
	});
    }
    
    addData(points, appearances){
	//takes points in universal coordinates and maps them to scaled coordinates
	//having the range 0 to 1

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

	    uniform float cx;
	    uniform float cy;


	    vec3 normalizeCoords(vec3 position) {
		// read in the positions into x and y vars
		
		float x = position[0];
		float y = position[1];
		float z = position[2];

		return vec3(
		    2.0 * (x - cx) / resolution,
			-2.0 * (y- cy) / resolution,
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

	
	this.regl(drawDots)({
	    points: points,
	    appearances: appearances,
	    resolution:this.width,
	    cx:this.cx*Math.pow(10,-1*this.lz),
	    cy:this.cy*Math.pow(10,-1*this.lz),
	});

	
    }
    



}
