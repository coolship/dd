//react architecture
import React, { Component } from 'react';
import { connect } from "react-redux";

//rendering tools
import initREGL from 'regl';
import _ from 'lodash';



class Overlay extends Component {

    constructor(nextprops){
	super(nextprops)
	this.state = {
	    computed_dataset_name:null
	}
    }
    
    pointsFromDataPropsState(data,nextprops,nextstate){
	let points = []
	const npoints = data.length
	var size = nextprops.view.pointsize
	const scl = 16
	for (var i = 0; i < npoints; i++){
	    points.push(
		{x:data[i][3]*scl,
		 y:data[i][4]*scl,
		 z:1- (Number(data[i][1]) +2) / 5,
		 id:data[i][0]
		}
	    )
	}
	return points
    }
  
    updateOverlay(){	
	const overlay_canvas = document.querySelector("#overlay-canvas");
	const overlay_context =overlay_canvas.getContext('webgl')
	const cwidth =this.props.width;
	const cheight =this.props.height;
	const aspect = cheight/cwidth;
	const that = this
	var overlay_regl = initREGL({
	    gl:overlay_context,
	})
	const drawDots = {
	    vert:`precision mediump float;
	    attribute vec2 position;
	    varying vec4 fragColor;
	    uniform vec4 color;

	    void main () {
		gl_PointSize = 10.0;

		float x = position[0];
		float y = position[1];
		
		gl_Position = vec4(x*2.0-1.0,(1.0 - y)*2.0-1.0,.5, 1);
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


	    uniforms: {
		color:function(context,props){return [255,255,255,1]},
	    },
 
	    // attributes
	    attributes: {
		position: function(context, props) {
		    return [[props.point_nx, props.point_ny]]
		}
	    },

	    // vertex count
	    count: function(context, props) {
		// set the count based on the number of points we have
		return 1
	    },
	    primitive: 'points'
	};

	
	overlay_regl.clear({
	    color: [255, 255, 255, 0],
	    depth: 1,
	});



	var nidx = this.props.app.select_umi_idx
	if (nidx >= 0){
	    var selected  = this.props.getSelectedPoint()
	    var {nx, ny} = selected
	    overlay_regl(drawDots)({
		point_nx:nx,
		point_ny:ny,
	    });
	}
    }

    
   
    render(){
	return <canvas
	id="overlay-canvas"
	width={window.innerWidth}
	height={window.innerHeight}
	    />
    }

    componentDidUpdate(){
	this.updateOverlay()	
    }
}


function mapStateToProps({app,backend}){
    return {app,backend}
}

export default connect(mapStateToProps, {})(Overlay)
