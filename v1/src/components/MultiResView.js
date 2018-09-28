import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import logo from '../logo.svg';
import _ from 'lodash';



import styled, { css } from 'styled-components';





class MultiResView extends Component {
    constructor(props){
	super(props);
	this.state = {};
	this.canvas_ref=React.createRef();
	this.context_ref=null;
    }

    render(){
	return (
	    <FullscreenCanvas
		     ref={this.canvas_ref}

		   width={this.props.clientWidth}
		   height={this.props.clientHeight}
		     id="regl-canvas"/>

	    
	);
    }

    getContext(){
	return this.getCanvas().getContext('2d');
    }

    getCanvas(){
	return  ReactDOM.findDOMNode(this.canvas_ref.current);
    }

    componentDidMount(){
	this.props.drawFromBuffer(this.getContext());
    }
    
    componentDidUpdate(prevProps,prevState){
	this.props.drawFromBuffer(this.getContext());
    }
}

function mapStateToProps({ }){
    return {};
}

export default connect(mapStateToProps, {},null,  { withRef: true })(MultiResView);

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
