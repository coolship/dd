import React, { Component } from 'react';
import { connect } from "react-redux";

class Fov extends Component {
    shouldComponentUpdate(nextprops, nextstate){
	if(this.props.source_canvas==null){ return false}
	return true
    }    
    render(){

	return (
		<canvas
	    onMouseMove={this.props.onMouseMove}
	    onMouseEnter={this.props.onMouseEnter}
	    onMouseLeave={this.props.onMouseLeave}
	    onClick={this.props.onClick}
	    width={""+window.innerWidth}
	    height={""+window.innerHeight}
	    id="regl-canvas"/>
	)
    }
    
    componentDidUpdate(){
	const canvas = document.querySelector("#regl-canvas");
	const context =canvas.getContext('2d');
	var source_scale = 1 / this.props.backend.scale_factor

	//clears the full canvas 
	context.setTransform(1,0,0,1,0,0)
	context.clearRect(0, 0, canvas.width, canvas.height);

	//applies source --> view transformations in reverse order
	context.setTransform(2,0,0,2,canvas.width/2,canvas.height/2)
	var {a,b,c,d,e,f} = this.props.app.transform;

	
	context.transform(a,b,c,d,e,f)
	context.transform(source_scale,0,0,source_scale,0,0)
	context.transform(1,0,0,1,-this.props.backend.resolution/2,-this.props.backend.resolution/2)
	//finally, draws the image
	context.drawImage(this.props.source_canvas,0,0)
	
    }
}

function mapStateToProps({view,backend, app}){
    return {view, backend, app}
}

export default connect(mapStateToProps, {})(Fov)
