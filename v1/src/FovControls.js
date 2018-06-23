import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import controller from './assets/fov.controller.svg';


class FovControls extends Component {
    constructor(props){
	super(props)
	this.controls = React.createRef();
    }


    //this cool little piece of code in-lines the svg used for the controls
    handleImageLoaded() {
	var c = ReactDOM.findDOMNode(this.controls.current)
	c.parentElement.replaceChild(c.contentDocument.documentElement.cloneNode(true), c);
    }

    handleClick(event){
	const tgt = event.target
	var controls = this.controls.current
	var cdom = ReactDOM.findDOMNode(controls)
	var that = this

	var el = tgt
	var count = 0
	while (el && el != cdom){
	    count+= 1
	    if( count > 10){break}
	    el = el.parentElement	    
	    if( el.id=="zoom-in"){
		that.props.zoomIn()
		break
	    }
	    if( el.id=="zoom-out"){
		that.props.zoomOut()
		break
	    }
	    if( el.id=="pan-right_1_"){
		that.props.jogRight()
		break
	    }
	    if( el.id=="pan-left_1_"){
		that.props.jogLeft()
		break
	    }
	    if( el.id=="pan-up_1_"){
		that.props.jogUp()
		break
	    }
	    if( el.id=="pan-down_1_"){
		that.props.jogDown()
		break
	    }
	    if (el.id=="export_1_"){
		console.log("exporting")
		that.props.exportPng()
		break
	    }
	}
    }
    
    
    render(){

	return 	(
		<div className="fov-controls"
	    onClick={this.handleClick.bind(this)}>
		<object type="image/svg+xml"
	    data={controller}
	    onLoad={this.handleImageLoaded.bind(this)}
	    ref={this.controls}
		>
		</object>
		</div>
	)
    }
    
}

export default FovControls;

