import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactDOM from "react-dom";
import logo from '../logo.svg';
import _ from 'lodash';

import  SvgSelectionView from "./SvgSelectionView";


import styled, { css } from 'styled-components';

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA: mixed, objB: mixed): boolean {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  var bHasOwnProperty = hasOwnProperty.bind(objB);
  for (var i = 0; i < keysA.length; i++) {
      if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

function shallowCompare(instance, nextProps, nextState) {
  return (
    !shallowEqual(instance.props, nextProps) ||
    !shallowEqual(instance.state, nextState)
  );
}



class MultiResView extends Component {
    constructor(props){
	super(props);
	this.state = {};
	this.canvas_ref=React.createRef();
	this.context_ref=null;
    }

    shouldComponentUpdate(nextProps,nextState){
	return shallowCompare(this, nextProps, nextState);
    }
    
    render(){
	return (
	    <div
		     onMouseMove={this.props.onMouseMove}
		     onMouseEnter={this.props.onMouseEnter}
		     onMouseLeave={this.props.onMouseLeave}
		     onKeyDown={this.props.onKeyDown}
		     onWheel={this.props.onWheel}
	       ><FullscreenCanvas
		     ref={this.canvas_ref}

		     width={this.props.viewport.clientWidth}
		     height={this.props.viewport.clientHeight}
		     id="regl-canvas"/>
	      	    {this.props.selection.select_umi_idx?
		<SvgSelectionView umis={[this.props.dataset.umis[this.props.selection.select_umi_idx]]}
	    x0={this.props.viewport.x0}
	    y0={this.props.viewport.y0}
	    x1={this.props.viewport.x0+this.props.viewport.clientWidth/this.props.viewport.zoom}
	    y1={this.props.viewport.y0+this.props.viewport.clientHeight/this.props.viewport.zoom}
	     clickFun={this.props.clickFun} />
	     :null}
		
	      <FullscreenLogoContainer waiting={this.props.app.waiting_for_data}><img src={logo} className="App-logo logo" alt="logo" /></FullscreenLogoContainer>
	    </div>
	    
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

function mapStateToProps({ viewport, app, selection}){
    return { viewport, app, selection};
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