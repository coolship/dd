import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactDOM from "react-dom"

class MultiResView extends Component {
    render(){
	return (
		<canvas
	    onMouseMove={this.props.onMouseMove}
	    onMouseEnter={this.props.onMouseEnter}
	    onMouseLeave={this.props.onMouseLeave}
	    onClick={this.props.onClick}
	    width={""+this.props.width}
	    height={""+this.props.height}
	    id="regl-canvas"
	    style={{backgroundColor:"green"}}/>
	)
    }


    
    componentDidUpdate(){
	const canvas = document.querySelector("#regl-canvas");
	const context =canvas.getContext('2d');
	//clears the full canvas 
	context.setTransform(1,0,0,1,0,0)
	context.clearRect(0, 0,
			  this.props.viewport.width,
			  this.props.viewport.height);
 	
	this.props.drawFromBuffer(context)
    }
}

function mapStateToProps({app, viewport}){
    return {app, viewport}
}

export default connect(mapStateToProps, {})(MultiResView)
