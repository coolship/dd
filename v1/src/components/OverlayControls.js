import React, { Component } from 'react';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';
import CloudDownload from 'react-icons/lib/md/cloud-download';

import OpenWith from 'react-icons/lib/md/open-with';
import SelectAll from 'react-icons/lib/md/select-all';
import Adjust from 'react-icons/lib/md/adjust';
import PanZoomControls from './PanZoomControls';
import DatasetSelect from './DatasetSelect';




export default class OverlayControls extends Component{

    //returns left and right controls containing FOV / camera manipulation
    //and dataset manipulation controls respectively
    render(){
	return <StyledOverlayControls>
	    <div className="left-controls">
	    <OpenWith className="boxed-icon" onClick={this.props.activatePanZoom}/>
	    <Adjust className="boxed-icon" onClick={this.props.activateCellSegmentation}/>
	    <SelectAll className="boxed-icon" onClick={this.props.activateSelection}/>
	    <CloudDownload className="boxed-icon" onClick={this.props.exportPng}/>
	    <PanZoomControls
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
