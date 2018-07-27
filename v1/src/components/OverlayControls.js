import React, { Component } from 'react';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';


import CenterFocusStrong from 'react-icons/lib/md/center-focus-strong';
import OpenWith from 'react-icons/lib/md/open-with';
import FovControls from './FovControls';


import AnnotationControls from "./AnnotationControls";



export default class OverlayControls extends Component{

    render(){
	return <StyledOverlayControls>
	    <div className="left-controls">
	    <CenterFocusStrong className="boxed-icon" onClick={this.props.centerView}/>
	    <FovControls
	zoomIn={this.props.zoomIn}
	panRight={this.props.panRight}
	panUp={this.props.panUp}
	centerview={this.props.centerView}
	    />
	</div>

	    <div className="right-controls">
	    <AnnotationControls/>
	</div>


	
	</StyledOverlayControls>;
    }
}



const StyledOverlayControls=styled.div`
pointer-events:none;
position:absolute;
bottom:0px;
left:0px;
right:0px;
text-align:left;
>*{
pointer-events:auto;
cursor:pointer;
}
.right-controls{
position:absolute;
right:0px;
bottom:0px;

}
`;
