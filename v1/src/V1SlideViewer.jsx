import React, { Component } from 'react';
import './V1SlideViewer.css';


class V1SlideViewer extends Component {

    render(){
	return (
		<div className="V1SlideViewer">
		<div className="wrapper">
		<div className="header">view your slide</div>
		<div className="fov-container"></div>
		<div className="fov">
		</div>
		</div>
		</div>
	</div>
	)
		
    }
}


export default V1SlideViewer;
