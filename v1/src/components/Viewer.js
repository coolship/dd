import React, { Component } from 'react';
import ReactDOM from "react-dom"

//app
import Welcome from "./Welcome";
import Slide from './Slide';
import FovControls from './FovControls';
import ViewConfig from './ViewConfig';

//redux-firebase
import { connect } from "react-redux";
import * as firebase from "firebase";
import datasetsStorageRef from "../config/firebase"

//images
import Fullscreen from 'react-icons/lib/md/fullscreen';
import FullscreenExit from 'react-icons/lib/md/fullscreen-exit';
import logo from '../logo.svg';



class Viewer extends Component {
    exportPng(){
	var rcanvas = document.querySelector("#reglFov > canvas:first-of-type")
	var data =  rcanvas.toDataURL();	
	var link = document.createElement("a");
	link.download = "slide.png";
	link.href = data;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
    }
    render(){
	return (

	    
	    
		<div className={"viewer main " +(this.props.app.is_fullscreen? 'fullscreen': 'not-fullscreen')}>
		<div className="wrapper">
		<Welcome/>
		<div className={"fov-container "+
				(this.props.app.waiting_for_data?"waiting":"rendered")
			       }>
		<Slide></Slide>
		<img src={logo} className="App-logo" alt="logo" />
		
	    
	    </div>
		
		<FovControls
	    className="fov-controls"
	    exportPng={ this.exportPng.bind(this)}
		/>
		<ViewConfig/>
		<div className="footer">
		copyright Josh Weinstein 2018
	    </div>
		</div>

	    </div>



	)
	
    }
}


function mapStateToProps( {datasets, app}){
    return {datasets, app};
}

export default connect( mapStateToProps, { } )(Viewer);
