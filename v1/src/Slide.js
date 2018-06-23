import React, { Component } from 'react';
import ReactDOM from 'react-dom';



import regl from 'regl';
import initREGL from 'regl';
var init_regl;


//const urlForBen='https://api.github.com/users/ben'




class Slide extends Component {
    constructor(props){
	super(props);
	


	this.state = {
	    points:this.pointsFromData(props.data),
	    scroll:0,
	    pan_horz:0,
	    pan_vert:0,
	    component_has_drawn:false,
	}
	console.log(this.state)
    }

    pointsFromData(data){
	let points = []
	const npoints = data.length
	for (var i = 0; i < npoints; i++){
	    points.push(
		{x:data[i][3]*16,
		 y:data[i][4]*16,
		 z:Math.random(),
		 id:data[i][0],
		 speed:0,
		 size:5,
		 color:[
		     data[i][1]===1?255:0,
		     data[i][1]===2?255:0,
		     data[i][1]===0?255:0,
		     1]}
	    )
	}
	return points
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
	if( scroll<1){scroll=1}
	if( scroll>1000){scroll=2000}
	this.setState({scroll:scroll});
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
	if (event.keyCode === 37){
	    this.panRight(-30)
	}
	if (event.keyCode === 38){
	    this.panUp(30)
	}
	if (event.keyCode === 39){
	    this.panRight(30)
	}
	if (event.keyCode === 40){
	    this.panUp(-30)
	}
	
	if (event.keyCode === 187){
	    this.zoomIn(25)
	}
	
	if (event.keyCode === 189){
	    this.zoomIn(-25)
	}
	if (event.keyCode === 13){
	    this.updateData()
	}
    }

    updateData(){

	this.setState({points:this.pointsFromData(this.props.data)})
	if (!this.state.component_has_drawn){
	    this.componentIsReady()
	    this.setState({"component_has_drawn":true})
	}
	
    }
    
    componentDidMount(){
	console.log("MOUNT COMPLETE")	
    }

    componentIsReady(){
	console.log("INITIALIZING COMPONENT")
	window.addEventListener("wheel", this.handleScroll.bind(this) , false);
	window.addEventListener('keydown', this.handleKeyDown.bind(this));	
	var that = this
	var rootDiv = ReactDOM.findDOMNode(this)	
	init_regl = initREGL({
	    container: rootDiv,
	})
	const canvas = document.querySelector("#reglFov > canvas:first-of-type");

	canvas.setAttribute("style", "display:block;");
	canvas.id="regl-canvas";


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
	    attribute vec3 position;
	    attribute float pointWidth;
	    uniform float zoom;
	    uniform float pan_horz;
	    uniform float pan_vert;
	    uniform float aspect;
	    varying vec4 fragColor;
	    attribute vec4 color;

	    vec3 normalizeCoords(vec3 position) {
		// read in the positions into x and y vars
		float x = position[0];
		float y = position[1];
		float z = position[2];

		return vec3(
		    (((x+pan_horz) / 2000.0 *zoom)  ),
		    // invert y to treat [0,0] as bottom left in pixel space
		    (((y+pan_vert) / aspect/  2000.0*zoom) ),
		    z);
	    }

	    void main () {
		gl_PointSize = pointWidth;
		gl_Position = vec4(normalizeCoords(position), 1);
		fragColor=color;
	    }`,
	    frag:` precision mediump float;
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
		    return props.points.map(function(point) {
			return [point.x, point.y, point.z]
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
		zoom:function(context,props){ return 1+ props.scroll / 100 },
		pan_horz:function(context,props){ return props.pan_horz   },
		pan_vert:function(context,props){ return  props.pan_vert   },
		aspect:function(context,props){return props.aspect}
	    },

	    // vertex count
	    count: function(context, props) {
		// set the count based on the number of points we have
		return props.points.length
	    },
	    primitive: 'points'
	});

	var that = this;

//	init_regl.frame(function(context) {
//	    //   //called each animation frame
	    var cwidth = canvas.parentElement.clientWidth;
	    var cheight = canvas.parentElement.clientHeight;
	    
	    canvas.setAttribute("width",cwidth);
	    canvas.setAttribute("height",cheight);
	    that.setState({aspect:cheight/cwidth})

	    drawDots({
		points: that.state.points,
		scroll:that.state.scroll,
		pan_horz:that.state.pan_horz,
		pan_vert:that.state.pan_vert,
		aspect:that.state.aspect,
	    });
//	});
	
	
    }
    
    
    render(props){
	return (
		<div id="reglFov" className="fov fov-black"  ref={this.fov} >
		</div>)
    }
}

export default Slide;


