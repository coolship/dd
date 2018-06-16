import React, { Component } from 'react';
import ReactDOM from 'react-dom';



const regl = require('regl')();
const glslify = require('glslify');



class Slide extends Component {

    constructor(props){
	super(props);

	const npoints = props.data.length
	
	let points = []
	let colors = []
	for (var i = 0; i < npoints; i++){
	    points.push(
		{x:props.data[i][3]*8,
		 y:props.data[i][4]*8,
		 id:props.data[i][0],
		 speed:0,
		 size:1,
		 color:[
		     props.data[i][1]==1?255:0,
		     props.data[i][1]==2?255:0,
		     props.data[i][1]==0?255:0,
		     1]}
	    )
	}

	this.state = {
	    points:points,
	}
    }
    
    componentWillMount(){
    }

    componentDidMount(){

	var that = this
	console.log(that.state.points)


	
	regl.frame(function(context) {
	    // Each loop, update the data
	    //updateData(points);

	    // And draw it!
	    drawDots({
		pointWidth: POINT_SIZE,
		points: that.state.points
	    });
	});

	
    }
    
    render(props){
	return (
		<div className="fov fov-black"  ref={this.fov} >
		</div>)
    }
}

export default Slide;






// Helper function to create a random float between
// some defined range. This is used to create some
// fake data. In a real setting, you would probably
// use D3 to map data to display coordinates.
function randomFromInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}

// Helper function to create a random integer between
// some defined range. Again, you would want to use
// D3 for mapping real data to display coordinates.
function randomIntFromInterval(min, max) {
  return Math.floor(randomFromInterval(min, max));
}

// Some constants to use
var MAX_WIDTH = 800;
var MAX_HEIGHT = 800;
var MAX_SPEED = 15;
var POINT_SIZE = 20;
var POINT_COUNT = 300;






// Helper function, goes through each
// element in the fake data and updates
// its x position.
function updateData(data) {
  data.forEach(function(datum) {
    datum.x += datum.speed
    // reset x if its gone past max width
    datum.x = datum.x > MAX_WIDTH ? 0 : datum.x;
  });
}


const drawDots = regl({



  // using textbook example from http://regl.party/api#blending
  blend: {
      enable: true,

  },
    

    vert:`precision mediump float;
attribute vec2 position;
attribute float pointWidth;


uniform float stageWidth;
    uniform float stageHeight;
    varying vec4 fragColor;
    attribute vec4 color;

vec2 normalizeCoords(vec2 position) {
// read in the positions into x and y vars
float x = position[0];
float y = position[1];

return vec2(
2.0 * ((x / stageWidth) ),
// invert y to treat [0,0] as bottom left in pixel space
-(2.0 * ((y / stageHeight) )));
}


void main () {
gl_PointSize = pointWidth;
    gl_Position = vec4(normalizeCoords(position), 0, 1);
    fragColor=color;

    
}`,
      frag:`  precision mediump float;
    varying vec4 fragColor;
    
  void main () {
  float r = 0.0, delta = 0.0, alpha = .5;
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
	    // @change I tweaked the constants here so
	    //  the dots are not off the screen
	    return props.points.map(function(point) {
		return [point.x, point.y]
	    });
	},
	
	pointWidth: function(context, props) {
	    return  props.points.map(function(point) {
		return point.size;
	    });
	},
	color:function(context,props){
	    return props.points.map(d => d.color)
	}
	    
    },
    // uniforms
    uniforms: {
	// FYI: there is a helper method for grabbing
	// values out of the context as well.
	// These uniforms are used in our fragment shader to
	// convert our x / y values to WebGL coordinate space.
	
	stageWidth: regl.context('drawingBufferWidth'),
	stageHeight: regl.context('drawingBufferHeight')
    },
    
    


  // vertex count
  count: function(context, props) {
    // set the count based on the number of points we have
    return props.points.length
  },
    primitive: 'points'
});






