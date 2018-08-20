import React, { Component } from 'react';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';
import CenterFocusStrong from 'react-icons/lib/md/center-focus-strong';
import CloudDownload from 'react-icons/lib/md/cloud-download';
import OpenWith from 'react-icons/lib/md/open-with';
import FovControls from './FovControls';
import DatasetSelect from './DatasetSelect';




export default class OverlayControls extends Component{

    //returns left and right controls containing FOV / camera manipulation
    //and dataset manipulation controls respectively
    render(){
	return <StyledOverlayControls>
	    <div className="left-controls">
	    <CenterFocusStrong className="boxed-icon" onClick={this.props.centerView}/>
	    <CloudDownload className="boxed-icon" onClick={this.props.exportPng}/>
	    <FovControls
	zoomIn={this.props.zoomIn}
	panRight={this.props.panRight}
	panUp={this.props.panUp}
	centerview={this.props.centerView}
	    />
	</div>
	{this.props.is_demo?null:<div className="right-controls">
	<DatasetSelect/>
	 </div>}
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
