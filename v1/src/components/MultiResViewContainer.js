//react architecture
import React, { Component } from 'react';
import { connect } from "react-redux";

//actions
import { setSelectUmiIdx, setSelectType, setViewport, setMouse, resetApp, setTransform} from "../actions";

//rendering tools
import initREGL from 'regl';
import _ from 'lodash';

//child components
import TwoModeCanvas from "./TwoModeCanvas";
import MultiResView from "./MultiResView";
import Overlay from "./Overlay";


//math tools
var knn = require('rbush-knn');


const default_state = {
	    mouse:null,
	}

class MultiResViewContainer extends Component {
    constructor(props){
	super(props);
	this.updateViewport();
	this.backend_ref=React.createRef()
    }

    updateViewport(){
	this.props.setViewport({
	    width:window.innerWidth,
	    height:window.innerHeight,
	})
    }

    getSelectedUmiXY(){
	if (!this.props.dataset.current_dataset){return null}
	var umi_idx = this.props.app.select_umi_idx;
	var umi_json = this.props.dataset.current_dataset.json[umi_idx]
	var dataX = umi_json[3]
	var dataY = umi_json[4]
	return {x:dataX,
		y:dataY}
    }
    

    resetApp(){
	this.setState(default_state)
	this.props.resetApp()	
    }

    onMouseMove(event){
	if(this.props.app.select_type==2){ return	}
	var winT = this.getWindowTransformation()	
	this.props.setMouse({x:(event.clientX - winT.e)/winT.a,
			     y:(event.clientY - winT.f)/winT.d})
	this.props.setSelectType(1);

	
	//this.findSelected()
	
    }
    onMouseEnter(event){
	if(this.props.app.select_type==2){ return	}
	this.props.setSelectType(1);	
    }
    onMouseLeave(event){
	if(this.props.app.select_type==2){ return	}
	this.props.setSelectType(0);
    }
    onClick(event){
	this.props.setSelectType(this.props.app.select_type==2?0:2);
    }
    componentWillUnmount(){
	window.removeEventListener('scroll', this.handleScroll);
	window.removeEventListener('keydown', this.handleKeyDown);
    }
    handleScroll(event){	
	this.zoomIn(-1 * event.deltaY,event)
    }
    
    handleResize(event){	
	this.updateViewport()
    }
    
    zoomIn(dz, event = null){
	//2. get normalized coordinates for this event in the drawing window

	var winT = this.getWindowTransformation()
	var vpT = this.getViewportTransformation()


	var clientX, clientY
	//1. get current position of the mouse in window coordinates
	if (event){
	    clientX = event.clientX;
	    clientY = event.clientY;
	} else {
	    clientX = winT.e
	    clientY = winT.f
	}


	

	var nX0 = (clientX - winT.e) / winT.a
	var nY0 = (clientY - winT.f) / winT.d
	
	//3. use render window to get data range of the mouse event

	//this is still a cheat... 
	var dataX = nX0 * (1200/vpT.a) + vpT.e
	var dataY = nY0 * (1200/vpT.d) + vpT.f
	

	//4. compute the new transformation
	var a0 = vpT.a
	var d0 = vpT.d
	var e0 = vpT.e
	var f0 = vpT.f

	
	var a = a0*(1+dz / 1000)
	var d = a
	
	var e = dataX - (dataX - vpT.e)*a0/a
	var f = dataY - (dataY - vpT.f)*d0/d


	this.props.setTransform(Object.assign({},this.props.app.transform,
					      {a,d,e,f}))	
	this.props.setMouse({dataX,dataY})

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
	    this.panRight(-30 / this.props.app.transform.a)
	}
	if (event.keyCode === 38){
	    this.panUp(-30 / this.props.app.transform.d)
	}
	if (event.keyCode === 39){
	    this.panRight(30 / this.props.app.transform.a)
	}
	if (event.keyCode === 40){
	    this.panUp(30 / this.props.app.transform.d)
	}
	if (event.keyCode === 187){
	    this.zoomIn(25)
	}
	if (event.keyCode === 189){
	    this.zoomIn(-25)
	}
    }

    appearancesFromData(data){
	let appearances = []
	for (var i = 0; i < data.length; i++){
	    appearances.push(
		{
		    size: 1,
		    color:this.props.view.colormap[data[i][1]]
		}
	    )
	}
	return appearances
    }
    
    pointsFromData(data){
	let points = []
	for (var i = 0; i < data.length; i++){
	    points.push(
		{x:data[i][3],
		 y:data[i][4],
		 z:1- (Number(data[i][1]) +2) / 5,
		 id:data[i][0]
		}
	    )
	}
	return points
    }
    

    componentWillReceiveProps(nextprops){
//	this.updateViewport();
    }
    
    componentDidMount(){
	window.addEventListener("resize", this.handleResize.bind(this) , false);
	window.addEventListener("wheel", this.handleScroll.bind(this) , false);
	window.addEventListener('keydown', this.handleKeyDown.bind(this));

    }
    findSelected(){	
	if(! this.state.mouse){return}
	var {clientX, clientY} = this.state.mouse

	return
	var {dataX,dataY} = null
	var bush = this.props.dataset.current_dataset.tree;
	let neighbors_1
	
	if (bush){neighbors_1 = knn(bush,dataX,dataY, 1); }
	else{console.log( "no rbush yet set up")}
	
	if (! neighbors_1){return}
	if( (neighbors_1.length)==0){
	    this.props.setSelectUmiIdx(-1)
	} else {
	    this.props.setSelectUmiIdx(neighbors_1[0].idx)
	}
    }

    getWindowTransformation(){
	var dimension = Math.max(this.props.viewport.width, this.props.viewport.height)

	return {a:dimension,
		b:0,
		c:0,
		d:dimension,
		e:dimension/2,
		f:dimension/2}
	
    }

    getViewportTransformation(){
	return this.props.app.transform;

    }

    getDataRange(){
	var {a,b,c,d,e,f} = this.getViewportTransformation()
	return 	{ x0 :  e-600/a,
		  x1: e + (600 / a ),
		  y0 : f-600/d,
		  y1 :  f + (600 / d )}

    }
    
    //works with a cleared 2d webgl context, having an initial transformation
    //coming from the child, having a scale factor of 2x and origin at w/2, h/2
    drawFromBuffer(child_context){


	var winT = this.getWindowTransformation()
	var vpT = this.getViewportTransformation()

	//zeros out the transformation
	child_context.setTransform(1, 0, 0, 1,0,0)
	//applies window transformation
	child_context.transform(winT.a,winT.b,winT.c,winT.d,winT.e,winT.f)
	
	child_context.transform(vpT.a,vpT.b,vpT.c,vpT.d,0,0)

	var backend = this.backend_ref.current.getWrappedInstance()
	var {a,b,c,d,e,f} = this.getViewportTransformation()
	var {x0,x1,y0,y1} = this.getDataRange()
	
	// queries dataset for a square window centered around (e,f) 
	// with data coord width 1200 / zoom
	// and data coord height 1200 / zoom 

	//this range of xs and ys will include all points which could be rendered
	backend.renderToContext(child_context,x0,x1,y0,y1)
    }
    
    render(props){
	return (
		<div id="reglFov" className="fov fov-black" data-rendered_dataset_name="" ref={this.fov} data-dataset_name={this.props.dataset.current_dataset?this.props.dataset.current_dataset.metadata.dataset:"" } >
		<TwoModeCanvas ref={this.backend_ref}/>
		<MultiResView
	    onMouseMove={this.onMouseMove.bind(this)}
	    onMouseEnter={this.onMouseEnter.bind(this)}
	    onMouseLeave={this.onMouseLeave.bind(this)}
	    onClick={this.onClick.bind(this)}
	    zoom={this.props.app.transform.a}
	    tx={this.props.app.transform.e}
	    ty={this.props.app.transform.f}
	    width={this.props.viewport.width}
	    height={this.props.viewport.height}
	    drawFromBuffer={this.drawFromBuffer.bind(this)}
	    bufferReady={this.props.app.waiting_for_data?false:true}
		/>
		
		<Overlay
	    getSelectedUmiXY={this.getSelectedUmiXY.bind(this)}
		/>
		
	    
	    </div>)
	
    }
    
}



function mapStateToProps( { dataset, app, view, backend, mouse, viewport } ) {
    return { dataset, app, view , backend, mouse, viewport };
}

export default connect(mapStateToProps, { setMouse,setViewport,  setSelectUmiIdx, setSelectType, setTransform  } )(MultiResViewContainer) 

