import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import controller from '../assets/fov.controller.svg';
import { connect } from "react-redux";
import { resetUIOnly } from "../actions";
import styled, { css } from 'styled-components';


import ArrowBack from 'react-icons/lib/md/arrow-back';
import ArrowDownward from 'react-icons/lib/md/arrow-downward';
import ArrowForward from 'react-icons/lib/md/arrow-forward';
import ArrowUpward from 'react-icons/lib/md/arrow-upward';
import ZoomIn from 'react-icons/lib/md/zoom-in';
import ZoomOut from 'react-icons/lib/md/zoom-out';
import Refresh from 'react-icons/lib/md/refresh';
import CenterFocusStrong from 'react-icons/lib/md/center-focus-strong';







class PanZoomControls extends Component {

    
    render(){

	return 	(
	    <PanZoomControlsStyled>

	      <ArrowBack className="btn boxed-icon" onClick={(event)=>{this.props.panRight(-6);}} />
		<ArrowForward className="btn boxed-icon" onClick={(event)=>{this.props.panRight(6)}}/>

		<ArrowUpward className="btn boxed-icon" onClick={(event)=>{this.props.panUp(-6)}}/>
		  <ArrowDownward className="btn boxed-icon" onClick={(event)=>{this.props.panUp(6)}}/>
		      <ZoomIn className="btn boxed-icon" onClick={(event)=>{this.props.zoomIn(20,{nx:.5,ny:.5})}}/>
			<ZoomOut className="btn boxed-icon" onClick={(event)=>{this.props.zoomIn(-20,{nx:.5,ny:.5})}}/>

			  <CenterFocusStrong className="btn boxed-icon" onClick={this.props.centerView}/>

	    </PanZoomControlsStyled>
	)
    }
    
}


function mapStateToProps( {app, components}){
    return {app, components};
}

export default connect( mapStateToProps, { resetUIOnly } )(PanZoomControls);



const PanZoomControlsStyled=styled.span`

btn{
cursor:pointer;
pointer-events:auto;
}
`;
