import React, { Component } from 'react';
import Slide from './Slide';
import FovControls from './FovControls';
import '../css/V1SlideViewer.css';
import logo from '../logo.svg';
import { connect } from "react-redux";
import Welcome from "./Welcome";

import Fullscreen from 'react-icons/lib/md/fullscreen';
import FullscreenExit from 'react-icons/lib/md/fullscreen-exit';



class V1SlideViewer extends Component {

    constructor(props) {
	
      super(props);
      this.state = {
	  counter:0,
	  fullscreen:true,
	  pointdata:[],
	  dataset:{},
      }
      
      this.handleAppFullscreenChanged = this.handleAppFullscreenChanged.bind(this);
      this.handleAppSlideIdChanged = this.handleAppSlideIdChanged.bind(this);
	this.fov = React.createRef();
	this.screenshotCanvas = React.createRef();
  }

    jogLeft(){this.fov.current.panRight(-100)}
    jogRight(){this.fov.current.panRight(100)}
    jogUp(){this.fov.current.panUp(100)}
    jogDown(){this.fov.current.panUp(-100)}
    zoomIn(){this.fov.current.zoomIn(25)}
    zoomOut(){this.fov.current.zoomIn(-25)}
    exportPng(){
	var data =  document.querySelector("#reglFov > canvas:first-of-type").toDataURL();

	
	var link = document.createElement("a");
	link.download = "slide.png";
	link.href = data;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

    }

    
    handleAppFullscreenChanged(event) {
	var cur_state = this.state
	cur_state.fullscreen = event.target.checked
	this.setState(cur_state);
    }

    resetDataset(data,metadata){
	console.log("viewer resetting")
	this.setState({pointdata:data,
		       dataset:metadata})
	this.fov.current.updateData()
	this.setState({"waiting":false})
    }
    
    handleAppSlideIdChanged(event){
	console.log(event.target.value)
	const tgt = event.target

	var selected = tgt.options[tgt.selectedIndex];
	var elt_data = selected.dataset;
	console.log(elt_data)
	var that = this;

	if (elt_data.dataset_fname === undefined){
	    that.resetDataset([],{
		"name":"test",
		"fname":null
	    }) 
	} else{

	    this.setState({"waiting":true})
	    var url = "http://storage.googleapis.com/slides.dna-microscopy.org/"+elt_data.dataset_fname
	fetch(url)
	    .then(response => {
		if (!response.ok) {
		    throw Error("Network request failed")
		}
		return response
	    })
	    .then(
		d => d.json())
		.then(d => {
		    console.log(d)
		that.resetDataset(d,
				  {
			"name":elt_data.dataset_name,
			"fname":elt_data.dataset_fname
		})
			
	    }, () => {
		this.setState({
		    requestFailed: true
		})
	    })	    
	}
    }

   
    componentDidMount(){
	this.timerID = setInterval(
	    () => this.tick(),
	    1000
	)
    }


    
    componentWillUnmount() {
	clearInterval(this.timerID);
    }
    
    tick(){
	var cval = this.state.counter+1;
	this.setState({counter:cval});
    }
    
    render(){
	return (

	   
	    
		<div className={"viewer main " +(this.state.fullscreen? 'fullscreen': 'not-fullscreen')}>

	    

		<div className="wrapper">
		<Welcome/>
		
		<div className={"fov-container "+(this.state.waiting?"waiting":"rendered")}>
		
		<Slide ref={this.fov} data={this.state.pointdata} counter={this.state.counter} dataset_name={this.state.dataset.name} ></Slide>
		<img src={logo} className="App-logo" alt="logo" />
	    
	    
	    </div>
		
		<FovControls className="fov-controls"
	    jogLeft={this.jogLeft.bind(this)}
	    jogRight={this.jogRight.bind(this)}
	    jogUp={this.jogUp.bind(this)}
	    jogDown={this.jogDown.bind(this)}
	    zoomIn={this.zoomIn.bind(this)}
	    zoomOut={this.zoomOut.bind(this)}
	    exportPng={this.exportPng.bind(this)}
		>
		</FovControls>
		<div className="footer">
		copyright Josh Weinstein 2018
	    </div>
		</div>
			    	<label className="toggle-fullscreen">
		<Fullscreen className="toggle-fullscreen-on icon"/><FullscreenExit className="icon toggle-fullscreen-off"/><input type="checkbox" id="app-toggle-fullscreen" checked={!! this.state.fullscreen } className="toggle-fullscreen" onChange={this.handleAppFullscreenChanged}/>

	    </label>
		</div>


	)
	
    }
}


function mapStateToProps( {datasets}){
    return {datasets};
}

export default connect( mapStateToProps, { } )(V1SlideViewer);
