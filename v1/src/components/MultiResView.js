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

// 		clientHeight: 798
// clientWidth: 974
// drawFromBuffer: ƒ ()
// sliceChangedTime: undefined
// x0: -24.95
// x1: 23.750000000000004
// y0: -20.599999999999998
// y1: 19.3
		if( (prevProps.clientHeight!= this.props.clientHeight) ||
		(prevProps.clientWidth!= this.props.clientWidth) ||
		(prevProps.x0!= this.props.x0) ||
		(prevProps.y0!= this.props.y0) ||
		(prevProps.sliceChangedTime  != this.props.sliceChangedTime )){

		console.log("WE UPDATED!")
	this.props.drawFromBuffer(this.getContext());
	}
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

