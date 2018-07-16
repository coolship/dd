import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import logo from '../logo.svg';



import styled, { css } from 'styled-components';


class MultiResView extends Component {
    render(){
	return (
	    <span><FullscreenCanvas
	    onMouseMove={this.props.onMouseMove}
	    onMouseEnter={this.props.onMouseEnter}
	    onMouseLeave={this.props.onMouseLeave}
	    onClick={this.props.onClick}
	    width={this.props.viewport.clientWidth}
	    height={this.props.viewport.clientHeight}
		     id="regl-canvas"/>
	      <FullscreenLogoContainer waiting={this.props.app.waiting_for_data}><img src={logo} className="App-logo logo" alt="logo" /></FullscreenLogoContainer>
	    </span>
	    
	);
    }


    
    componentDidUpdate(){
	const canvas = document.querySelector("#regl-canvas");
	const context =canvas.getContext('2d');
	//clears the full canvas 
	context.setTransform(1,0,0,1,0,0);
	context.clearRect(0, 0,
			  this.props.viewport.width,
			  this.props.viewport.height);
 	
	this.props.drawFromBuffer(context);
    }
}

function mapStateToProps({app, viewport, query}){
    return {app, viewport, query};
}

export default connect(mapStateToProps, {})(MultiResView);

const FullscreenCanvas=styled.canvas`
position:absolute;
left:0px;
top:0px;
bottom:0px
right:0px;
`;

const FullscreenLogoContainer = styled.div`
position:absolute;
left:0px;
top:0px;
bottom:0px;
right:0px;
background-color:black;
display:${props=> props.waiting?"block":"none"};
.logo{
left:25%;
top:50%;
height:128px;
width:128px;
margin-top:-64px;
margin-left:-64px;
position:absolute;
}
`;
