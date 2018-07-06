//react architecture
import React, { Component } from 'react';
import { connect } from "react-redux";

//actions
import { setSelectUmiIdx, setSelectType ,resetApp, setTransform} from "../actions";

//rendering tools
import initREGL from 'regl';
import _ from 'lodash';

//child components
import BackendCanvas from "./BackendCanvas";
import Fov from "./Fov";
import Overlay from "./Overlay";

//math tools
var rbush = require('rbush');
var knn = require('rbush-knn');


const default_state = {
	    mouse:null,
	    computed_dataset_name:null,
	    rbush:null,
	}

class Slide extends Component {
    constructor(props){
	super(props);
	this.state = Object.apply({},default_state)
    }

    getSelectedPoint(){
	if (!this.props.dataset.current_dataset){return null}
	var umi_idx = this.props.app.select_umi_idx;
	var umi_json = this.props.dataset.current_dataset.json[umi_idx]
	var dataX = umi_json[3]
	var dataY = umi_json[4]

	var {a,b,c,d,e,f} = this.props.app.transform
	var clientDX = dataX * a
	var clientDY = dataY * d
	var clientX = clientDX + window.innerWidth / 2 + e
	var clientY = clientDY + window.innerHeight / 2 + f
	
	//var {clientX, clientY} = this.dataToClientCoords({dataX,dataY})	
	return {nx:clientX / window.innerWidth,
		ny:clientY / window.innerHeight}
    }


    resetApp(){
	this.setState(default_state)
	this.props.resetApp()	
    }
    
    updateMousePos(event){
	var cwidth =window.innerWidth;
	var cheight =window.innerHeight;
	var nx = (event.clientX - cwidth / 2) *2 /cwidth
	var ny = (( cheight - event.clientY) - cheight / 2)*2 /cheight
	this.setState({mouse:{nx:nx,
			      ny:ny,
			      clientX:event.clientX,
			      clientY:event.clientY}})
    }
    onMouseMove(event){
	if(this.props.app.select_type==2){ return	}
	this.updateMousePos(event)
	this.props.setSelectType(1);
	//this.findSelected()
	//this.updateOverlay()
	
    }
    onMouseEnter(event){
	if(this.props.app.select_type==2){ return	}
	this.updateMousePos(event);
	this.props.setSelectType(1);	
    }
    onMouseLeave(event){
	if(this.props.app.select_type==2){ return	}
	this.props.setSelectType(0);
    }
    onClick(event){
	this.props.setSelectType(this.props.app.select_type==2?0:2);
    }
    onBackendCanvasChanged(backend_canvas){
	this.setState({source_canvas:backend_canvas})
    }
    componentWillUnmount(){
	window.removeEventListener('scroll', this.handleScroll);
	window.removeEventListener('keydown', this.handleKeyDown);
    }
    handleScroll(event){	
	this.zoomIn(-1 * event.deltaY,event)
    }
    
    dataToClientCoords({dataX,dataY}){
	var {a,b,c,d,e,f} =this.props.app.transform
	var clientDX = dataX * a
	var clientDY = dataY * d
	var clientX = clientDX + window.innerWidth / 2 + e
	var clientY = clientDY + window.innerHeight / 2 + f
	return {clientX, clientY}
    }
    
    clientToDataCoords({clientX,clientY}){
	const {a,d,e,f} = this.props.app.transform;
	var clientDX = clientX -( window.innerWidth / 2 + e )
	var dataX = clientDX / a
	var clientDY = clientY -(window.innerHeight / 2 + f )
	var dataY = clientDY / d
	return {dataX,dataY}
    }
    
    zoomIn(dz, event = null){
	let {a,b,c,d,e,f} = this.props.app.transform
	var {clientX,clientY} = this.state.mouse
	var {dataX,dataY} = this.clientToDataCoords({clientX,clientY})
		
	var new_a = a*(1+dz / 1000)
	var new_d = d*(1+dz / 1000)
	var newX =  dataX
	var newY =  dataY
	var newClientX = new_a * newX + e + window.innerWidth/2
	var newClientY = new_d * newY + f + window.innerHeight/2
	var oldCX = a * newX + e + window.innerWidth/2
	var clientDx = newClientX - clientX
	var clientDy = newClientY - clientY
	var new_e = e -  clientDx
	var new_f = f -  clientDy

	this.props.setTransform(Object.assign({},this.props.app.transform,
				   {a:new_a,
				    d:new_d,
				    e:new_e,
				    f:new_f}))
    }
    panRight(dx){
	const e = this.props.app.transform.e + dx
	this.props.setTransform(Object.assign({},this.props.app.transform,{e}))
    }
    panUp(dy){
	const f = this.props.app.transform.f + dy
	this.props.setTransform(Object.assign({},this.props.app.transform,{f}))
    }
    handleKeyDown(event) {
	if (event.keyCode === 37){
	    this.panRight(-30)
	}
	if (event.keyCode === 38){
	    this.panUp(30)
	}
	if (event.keyCode === 39){
	    this.panRight(30)
	}
	if (event.keyCode === 40){
	    this.panUp(-30)
	}
	if (event.keyCode === 187){
	    this.zoomIn(25)
	}
	if (event.keyCode === 189){
	    this.zoomIn(-25)
	}
    }

    componentWillReceiveProps(nextprops){
	let data
	let tree	
	if(nextprops.dataset.current_dataset){
	    data = nextprops.dataset.current_dataset
	    if (data.metadata.dataset != this.state.computed_dataset_name){
		tree = rbush()
		tree.load(_.map(data.json,
				function(e,i){
				    return {minX:e[3],
					    maxX:e[3],
					    minY:e[4],
					    maxY:e[4],
					    id:e[0],
					    type:e[1],
					    idx:i,
					   }}
			       ))
		this.setState({rbush:tree});
		this.setState({computed_dataset_name:data.metadata.dataset});
	    }	    
	} else{
	    this.setState(null);
	    this.setState(null);
	}	
    }
    
    componentDidMount(){
	window.addEventListener("wheel", this.handleScroll.bind(this) , false);
	window.addEventListener('keydown', this.handleKeyDown.bind(this));

    }
    render(props){
	return (
		<div id="reglFov" className="fov fov-black" data-rendered_dataset_name="" ref={this.fov} data-dataset_name={this.props.dataset.current_dataset?this.props.dataset.current_dataset.metadata.dataset:"" } >
		<BackendCanvas
	    onCanvasChanged={this.onBackendCanvasChanged.bind(this)}
		/>
		
		<Fov
	    onMouseMove={this.onMouseMove.bind(this)}
	    onMouseEnter={this.onMouseEnter.bind(this)}
	    onMouseLeave={this.onMouseLeave.bind(this)}
	    onClick={this.onClick.bind(this)}
	    source_canvas={this.state.source_canvas}
		/>
			
		<Overlay
	    getSelectedPoint={this.getSelectedPoint.bind(this)}
		/>
		
	    
	    </div>)
	
    }
    componentDidUpdate(){
	//this.updateOverlay();
    }


    initSearchTree(){
    }
  
    findSelected(){
	
	if(! this.state.mouse){return}
	var {clientX, clientY} = this.state.mouse
	var {dataX,dataY} = this.clientToDataCoords({clientX,clientY})	
	var bush = this.state.rbush;
	let neighbors_1
	
	if (bush){
	    neighbors_1 = knn(bush,dataX,dataY, 1);    
	}
	if(!bush){
	    console.log( "no rbush yet set up")
	}
	
	
	if (! neighbors_1){return}
	if( (neighbors_1.length)==0){
	    this.props.setSelectUmiIdx(-1)
	} else {
	    this.props.setSelectUmiIdx(neighbors_1[0].idx)
	}
    }
    
    
}


function mapStateToProps( { dataset, app, view, backend } ) {
    return { dataset, app, view , backend};
}


export default connect(mapStateToProps, {  setSelectUmiIdx, setSelectType, setTransform  } )(Slide) 

