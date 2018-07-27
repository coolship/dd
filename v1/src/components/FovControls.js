import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import controller from '../assets/fov.controller.svg';
import { connect } from "react-redux";
import {  } from "../actions";
import styled, { css } from 'styled-components';


import ArrowBack from 'react-icons/lib/md/arrow-back';
import ArrowDownward from 'react-icons/lib/md/arrow-downward';
import ArrowForward from 'react-icons/lib/md/arrow-forward';
import ArrowUpward from 'react-icons/lib/md/arrow-upward';
import ZoomIn from 'react-icons/lib/md/zoom-in';
import ZoomOut from 'react-icons/lib/md/zoom-out';





class FovControls extends Component {

    
    render(){

	return 	(
	    <FovControlsStyled>
	      <ArrowBack className="boxed-icon" onClick={(event)=>{this.props.panRight(-100);}} />
		<ArrowUpward className="boxed-icon" onClick={(event)=>{this.props.panUp(100)}}/>
		  <ArrowDownward className="boxed-icon" onClick={(event)=>{this.props.panUp(-100)}}/>
		    <ArrowForward className="boxed-icon" onClick={(event)=>{this.props.panRight(100)}}/>
		    <ZoomIn className="boxed-icon" onClick={(event)=>{this.props.zoomIn(100)}}/>
		    <ZoomOut className="boxed-icon" onClick={(event)=>{this.props.zoomIn(-100)}}/>
	    </FovControlsStyled>
	)
    }
    
}


function mapStateToProps( {app, components}){
    return {app, components};
}

export default connect( mapStateToProps, { } )(FovControls);



const FovControlsStyled=styled.span`
`;
