import React, { Component } from 'react';
import ReactDOM from 'react-dom';



import regl from 'regl';
import initREGL from 'regl';
const init_regl = initREGL()

const glslify = require('glslify');



class Slide extends Component {
    constructor(props){
	super(props);
	const npoints = props.data.length
	
	let points = []
	let colors = []
	for (var i = 0; i < npoints; i++){
	    points.push(
		{x:props.data[i][3]*16,
		 y:props.data[i][4]*16,
		 z:-1*props.data[i][1],
		 id:props.data[i][0],
		 speed:0,
		 size:4,
		 color:[
		     props.data[i][1]==1?255:0,
		     props.data[i][1]==2?255:0,
		     props.data[i][1]==0?255:0,
		     1]}
	    )
	}

	this.state = {
	    points:points,
	    scroll:0,
	    pan_horz:0,
	    pan_vert:0,
	}
    }
    
    componentWillUnmount(){
	window.removeEventListener('scroll', this.handleScroll);
	window.removeEventListener('keydown', this.handleKeyDown);


    }

    handleScroll(event){
	this.zoomIn(event.deltaY)
    }

    zoomIn(dz){
	var current_scroll = this.state.scroll;
	var scroll=current_scroll+dz;
	var state = this.state;
	state.scroll = scroll;
	this.setState(state);
    }
    panRight(dx){
	var state = this.state;	
	state.pan_horz +=dx;
	this.setState(state);
    }
    panUp(dy){
	var state = this.state;	
	state.pan_vert +=dy
	this.setState(state);
    }

    handleKeyDown(event) {
	if (event.keyCode == 37){
	    this.panRight(-30)
	}
	if (event.keyCode == 38){
	    this.panUp(30)
	}
	if (event.keyCode == 39){
	    this.panRight(30)
	}
	if (event.keyCode == 40){
	    this.panUp(-30)
	}	
    }
    
    componentDidMount(){
	window.addEventListener("wheel", this.handleScroll.bind(this) , false);
	window.addEventListener('keydown', this.handleKeyDown.bind(this));

	//window.addEventListener('scroll', this.handleScroll);
	
	var that = this
	var rootDiv = ReactDOM.findDOMNode(this)

	

	var reglObj = regl({
	    container: rootDiv,
	})

	
	
	reglObj.frame(function(context) {
	    // Each loop, update the data
	    //updateData(points);

	    // And draw it!
	    drawDots({
		pointWidth: POINT_SIZE,
		points: that.state.points,
		scroll:that.state.scroll,
		pan_horz:that.state.pan_horz,
		pan_vert:that.state.pan_vert,
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


const drawDots = init_regl({


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
      alpha: 'subtract'
    },
    color: [0, 0, 0, 0]
  },

    vert:`precision mediump float;
attribute vec2 position;
    attribute float pointWidth;
    uniform float zoom;
    uniform float pan_horz;
    uniform float pan_vert;


uniform float stageWidth;
    uniform float stageHeight;
    varying vec4 fragColor;
    attribute vec4 color;

vec2 normalizeCoords(vec2 position) {
// read in the positions into x and y vars
float x = position[0];
float y = position[1];
    
return vec2(
    (((x+pan_horz) / stageWidth*zoom)  ),
// invert y to treat [0,0] as bottom left in pixel space
    (((y+pan_vert) / stageHeight*zoom) ));
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
	
	stageWidth: init_regl.context('drawingBufferWidth'),
	stageHeight: init_regl.context('drawingBufferHeight'),
	zoom:function(context,props){ return 1+ props.scroll / 100 },
	pan_horz:function(context,props){ return props.pan_horz   },
	pan_vert:function(context,props){ return  props.pan_vert   },
    },
    
    


  // vertex count
  count: function(context, props) {
    // set the count based on the number of points we have
    return props.points.length
  },
    primitive: 'points'
});






