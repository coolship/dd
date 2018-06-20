import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Slide from './Slide';
import './V1SlideViewer.css';
import controller from './assets/fov.controller.svg';
import pako from 'pako';
import data from './slides/927_umis_5c_flt_10.json';

class V1SlideViewer extends Component {

  constructor(props) {
      super(props);
      this.state = {
	  counter:0
      }
      this.controls = React.createRef();
      this.fov = React.createRef();
  }

    //this cool little piece of code in-lines the svg used for the controls
    handleImageLoaded() {
	var c = ReactDOM.findDOMNode(this.controls.current)
	c.parentElement.replaceChild(c.contentDocument.documentElement.cloneNode(true), c);
    }

    componentDidMount(){
	/*
	fetch('/users')
	    .then(function(res){return res.json()})
	    .then(users => this.setState({ users }));
*/
    
/*
	fetch("/slides/927_umis_5c_flt_1000.json")
	    .then(function(response) {
		if (response.status >= 400) {
		    throw new Error("Bad response from server");
		}
		return response;
	    })
	    .then(function(data) {
		console.log("successfully fetched 1000 datapoints")
		console.log(data);
	    });

*/
	
	var that = this;
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
		<div className="V1SlideViewer">
		<div className="wrapper">
		<div className="header">view your slide</div>
		<div className="fov-container">
		<Slide data={data} counter="1" ></Slide>
		</div>
		<div className="controls">

		<object type="image/svg+xml"
	    data={controller}
	    ref={this.controls}
	    onLoad={this.handleImageLoaded.bind(this)}>
		</object>
	    

	    
	    </div>
		<div className="footer">
		copyright Josh Weinstein 2018
		</div>
		</div>
		</div>
	)
	
    }
}


export default V1SlideViewer;
