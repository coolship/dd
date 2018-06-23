import React, { Component } from 'react';
import Slide from './Slide';
import FovControls from './FovControls';
import ModalUpload from './ModalUpload';
import MyGoogleLogin from './GoogleLogin';
import DatasetSelect from './DatasetSelect';
import './css/V1SlideViewer.css';
import logo from './logo.svg';

import Fullscreen from 'react-icons/lib/md/fullscreen';
import FullscreenExit from 'react-icons/lib/md/fullscreen-exit';



const canvasStyle = {
    content: {
	position:'absolute',
	width:'100px',
	height:'100px',
	backgroundColor:'red',
    }
};



//client id 211180157594-m5cchnk0hnh6iu0j7hkiekfehbsd146s.apps.googleusercontent.com
//client secret ULYkLxvPJjqXnXtQJom7cA4-



class V1SlideViewer extends Component {

    constructor(props) {
	
      super(props);
      this.state = {
	  counter:0,
	  fullscreen:false,
	  pointdata:[],
	  dataset:{},
	  filenames:[]
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
	var webGLTestCanvas =  document.querySelector("#reglFov > canvas:first-of-type");

	var videocanvas = document.getElementById("screenshotCanvas");
	const vctx = videocanvas.getContext('2d');
	vctx.drawImage(webGLTestCanvas, 0, 0); 
	const capturedImage = videocanvas.toDataURL();

	
	//var ctx = canvas.getContext('3d');
	//ctx.fillStyle = '#ff5';
	//ctx.fillRect(0, 0, canvas.width, canvas.height);

	

	
	//var data = canvas.toDataURL();



	
	var link = document.createElement("a");
	link.download = "slide.png";
	link.href = capturedImage;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);


	
	window.vcanvas = videocanvas
	window.vctx = vctx
	
	//delete link;
	
	//var prev = window.location.href;
	//window.location.href = data.replace("image/png", "image/octet-stream");
	//window.location.href = prev;
	
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

	var that = this	
	this.timerID = setInterval(
	    () => this.tick(),
	    1000
	)

	
    }

    activateUser(){
	
	var list_directory_url = "https://www.googleapis.com/storage/v1/b/slides.dna-microscopy.org/o"
	const token = this.state.access_token

	var that = this
	
	fetch(list_directory_url,{
	    method:'GET',
	    headers:{
		"Content-Type": "application/json",
		'Authorization': 'Bearer ' + token,
	    }
	}).then(function(response){
	    //console.log(response)
	    //console.log(response.json())
	    return response.json()
	}).then(function(success){

	    var result = success
	    console.log(result)
	    console.log(result.items)
	    that.setState({filenames:result.items.map(function(e,i){return e.name})
			   .filter(function(e){return e.search("dataset")>=0
					       && e.split("/").slice(-1) != "" })
			  })
	    that.setState({directoryListing:result})
	    console.log(that.state.filenames)

	    
	})

    }
    
    setAccessToken(token){
	this.setState({"access_token":token})
	this.activateUser()
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

	   
	    
		<div className={"V1SlideViewer " +(this.state.fullscreen? 'fullscreen': 'not-fullscreen')}>

		<MyGoogleLogin
	    setAccessToken={this.setAccessToken.bind(this)}
	    hasAccessToken={!!this.state.access_token}
		/>

	    
		<div className="wrapper">
		<div className="app-controls">
		<h1>Welcome to DNA microscopy</h1>
		{this.state.dataset.name?"viewing " + this.state.dataset.name:"please choose a dataset to view"}
	    
		<form>
		<label><DatasetSelect
	    handleAppSlideIdChanged={this.handleAppSlideIdChanged.bind(this)}
	    names={this.state.filenames}/></label>

		<div className="icons">
		<label className="upload-dataset">
		<ModalUpload appComponent={this}>
		</ModalUpload>
		
	    </label>
		<label className="toggle-fullscreen">
		<Fullscreen className="toggle-fullscreen-on icon"/><FullscreenExit className="icon toggle-fullscreen-off"/><input type="checkbox" id="app-toggle-fullscreen" checked={!! this.state.fullscreen } className="toggle-fullscreen" onChange={this.handleAppFullscreenChanged}/>
		</label>
		</div>
		
	    </form>
		</div>
		
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
		<canvas 
	    id="screenshotCanvas"
	    width="800"
	    height="800"
	    style={ canvasStyle }
		>
		</canvas>
		<div className="footer">
		copyright Josh Weinstein 2018
	    </div>
		</div>
		</div>
	)
	
    }
}


export default V1SlideViewer;
