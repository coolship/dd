import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import controller from '../assets/fov.controller.svg';
import { connect } from "react-redux";
import { setTransform } from "../actions";
import styled, { css } from 'styled-components';


import ArrowBack from 'react-icons/lib/md/arrow-back';
import ArrowDownward from 'react-icons/lib/md/arrow-downward';
import ArrowForward from 'react-icons/lib/md/arrow-forward';
import ArrowUpward from 'react-icons/lib/md/arrow-upward';
import ZoomIn from 'react-icons/lib/md/zoom-in';
import ZoomOut from 'react-icons/lib/md/zoom-out';
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

    zoomIn(dz){
	var a = this.props.app.transform.a * (1+dz / 1000);
	var d = this.props.app.transform.d *( 1+dz / 1000);
	this.props.setTransform(Object.assign({}, this.props.app.transform, {a,d}));
    }

    panRight(dx){
	var e = this.props.app.transform.e +dx
	this.props.setTransform(Object.assign({}, this.props.app.transform, {e}))
    }
    panUp(dy){
	var f = this.props.app.transform.f +dy
	this.props.setTransform(Object.assign({}, this.props.app.transform, {f}))
    }
    
    
    
    
    render(){

	return 	(
	    <FovControlsStyled>
	      <ArrowBack className="icon" onClick={(event)=>{this.panRight(-100);}} />
		<ArrowUpward className="icon" onClick={(event)=>{this.panUp(100)}}/>
		  <ArrowDownward className="icon" onClick={(event)=>{this.panUp(-100)}}/>
		    <ArrowForward className="icon" onClick={(event)=>{this.panRight(100)}}/>
		    <ZoomIn className="icon" onClick={(event)=>{this.zoomIn(100)}}/>
		    <ZoomOut className="icon" onClick={(event)=>{this.zoomIn(-100)}}/>
		      <Refresh className="icon" onClick={(event)=>{this.props.onReset()}}/>
	    </FovControlsStyled>
	)
    }
    
}


function mapStateToProps( {app, components}){
    return {app, components};
}

export default connect( mapStateToProps, { setTransform } )(FovControls);



const FovControlsStyled=styled.div`
	.icon{
	    &:first-child{
		margin-left:0px;
	    }
	    opacity:1;
	    font-size:1.5em;
	    display:inline;
	    padding:5px;
	    border:2px solid;
	    cursor:points;
	    margin:5px;
	    border-radius:4px;
	}
	.icon:hover{
	    background-color:white;
	    color:black;
	    opacity:.8;
	    
	}    
`;
