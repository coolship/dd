import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import controller from '../assets/fov.controller.svg';
import { connect } from "react-redux";
import { setTransform } from "../actions";

import ArrowBack from 'react-icons/lib/md/arrow-back';
import ArrowDownward from 'react-icons/lib/md/arrow-downward';
import ArrowForward from 'react-icons/lib/md/arrow-forward';
import ArrowUpward from 'react-icons/lib/md/arrow-upward';
import Refresh from 'react-icons/lib/md/refresh';
import CloudDownload from 'react-icons/lib/md/cloud-download';





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

    exportPng(){
	var rcanvas = document.querySelector("#reglFov > canvas:first-of-type")
	var data =  rcanvas.toDataURL();	
	var link = document.createElement("a");
	link.download = "slide.png";
	link.href = data;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
    }


    zoomIn(dz){
	var a = this.props.app.transform.a * (1+dz / 1000)
	var d = this.props.app.transform.d *( 1+dz / 1000)
	this.props.setTransform(Object.assign({}, this.props.app.transform, {a,d}))
    }

    panRight(dx){
	var e = this.props.app.transform.e +dx
	this.props.setTransform(Object.assign({}, this.props.app.transform, {e}))
    }
    panUp(dy){
	var f = this.props.app.transform.f +dy
	this.props.setTransform(Object.assign({}, this.props.app.transform, {f}))
    }
    
    handleClick(event){
	const tgt = event.target
	var controls = this.controls.current
	var cdom = ReactDOM.findDOMNode(controls)
	var that = this

	var el = tgt
	var count = 0
	while (el && el !== cdom){
	    count+= 1
	    if( count > 10){break}
	    el = el.parentElement	    
	    if( el.id==="zoom-in"){
		this.zoomIn(1000)

		break
	    }
	    if( el.id==="zoom-out"){
		this.zoomIn(-1000)

		break
	    }
	    if( el.id==="pan-right_1_"){
		this.panRight(100)

		break
	    }
	    if( el.id==="pan-left_1_"){
		this.panRight(100)

		break
	    }
	    if( el.id==="pan-up_1_"){
		this.panUp(100)

		break
	    }
	    if( el.id==="pan-down_1_"){
		this.panUp(-100)

		break
	    }
	    if (el.id==="export_1_"){
		that.props.exportPng()
		break
	    }
	    
	    if (el.id==="reset_1_"){
		that.props.onReset()
		break
	    }

	}
    }
    
    
    
    render(){

	return 	(
		<div className="fov-controls"
	    onClick={this.handleClick.bind(this)}><ArrowBack className="icon" onClick={(event)=>{this.panRight(-100)}}/>
		<ArrowUpward className="icon" onClick={(event)=>{this.panUp(100)}}/>
		<ArrowDownward className="icon" onClick={(event)=>{this.panUp(-100)}}/>
		<ArrowForward className="icon" onClick={(event)=>{this.panRight(100)}}/>
		<Refresh className="icon" onClick={(event)=>{this.props.onReset()}}/>
		<CloudDownload className="icon" onClick={(event)=>{this.exportPng()}}/>
	    
		</div>
	)
    }
    
}


function mapStateToProps( {app}){
    return {app};
}

export default connect( mapStateToProps, { setTransform } )(FovControls);



