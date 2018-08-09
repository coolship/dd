//react architecture
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';
import {MODALS} from "../layout";


//actions
import { setSelectUmiIdx, setSelectType, setViewport, setMouse, resetApp, setViewportWH, setViewportTransform, setViewportXY, registerImageContainer, activateModal} from "../actions";

//rendering tools
import initREGL from 'regl';
import _ from 'lodash';

//child components
import TwoModeCanvas from "./TwoModeCanvas";
import MultiResView from "./MultiResView";
import OverlayControls from "./OverlayControls";
import SelectionInfo from "./SelectionInfo";
import ModalSelectionContainer from "./ModalSelectionContainer";
import RenderContainer from "./RenderContainer";

import {Dataset} from "../data/Dataset";


const INTERACTION_STATES={
    "NONE":0,
    "HOVER":1,
    "FREEZE":2
};


class DatasetContainer extends RenderContainer {

    //LIFECYCLE METHODS
    constructor(props){
	super(props);

	this.syncViewport();
	this.state= {
	    progress:0,
	    fetching_dataset:false,
	    dataset_fetched_name:null,
	};
	this.bound_resize = this.handleResize.bind(this);
	this.bound_wheel = this.handleScroll.bind(this);
	this.bound_click = this.onClick.bind(this);
	this.bound_keydown = this.handleKeyDown.bind(this);
	this.requests = {};
	this.export_canvas_ref=React.createRef();

    }

    shouldComponentUpdate(nextprops,nextstate){
	if(nextprops.which_dataset != nextstate.dataset_fetched_name){
	    nextstate.dataset_fetched_name=null;
	}
	return true;
    }

    fetchDataset(resolve) {
	const metadata = _.find(this.props.datasets,(d)=>d.dataset==this.props.which_dataset);
	var that = this;
	var url = metadata.downloadUrl;
	
	that.setState({loading_progress:5,
		       loading_status:"fetching dataset from server"});
	this.requests.json = fetch(url).then(function(response) {
	    return response.json();
	}).then(function(myJson) {
	    const coords_data = myJson;
	    that.requests.json = null;
	    that.setState({loading_progress:20,
			   loading_status:"creating microscope view"});	    
	    that.dataset = new Dataset(metadata.dataset,
				       coords_data,
				       metadata.annotations_url
				      );
	    resolve();

	}).catch((err)=>{throw err;});

    };
    resetDataset(){
	
	var that = this;
	that.resetting=true;
	this.setState({"dataset_fetched_name":null});
	var p = new Promise(resolve=>{
	    that.fetchDataset(resolve);
	}).then(function(result){

	    return new Promise(resolve=>{
		that.dataset.initializeAsync(
		    (loading_progress,loading_status)=>{
			console.log("setting state", loading_progress);
			that.setState({loading_progress:loading_progress* .5+20,loading_status});
		    },
		    ()=>{
			that.setState({
			    dataset_fetched_name:that.props.which_dataset,
			    loading_progress:100,
			    loading_status:"complete",
			});
			resolve();
		    }
		)
	    });
	}).then(function(){
	    that.resetting=false;
	});
    }
    componentDidMount(){
	var that = this;
	window.addEventListener("resize", this.bound_resize , false);
	if(this.props.which_dataset != this.state.dataset_fetched_name){
	    if(!this.resetting){this.resetDataset()}
	}
    };
    componentDidUpdate(){
	var that = this;
	if(this.props.which_dataset != this.state.dataset_fetched_name){
	    if(!this.resetting){this.resetDataset();}
	}	
    }
    
    componentWillUnmount(){
	window.removeEventListener('resize', this.bound_resize);
    }
    onMouseEnter(event){
	if(this.props.selection.select_type==INTERACTION_STATES.FREEZE){return;}
	this.props.setSelectType(1);	
    }
    onMouseLeave(event){
	if(this.props.selection.select_type==INTERACTION_STATES.FREEZE){return;}
	this.props.setSelectType(0);
    }
    onClick(event){
	this.props.setSelectType(
	    this.props.selection.select_type==INTERACTION_STATES.FREEZE?
		INTERACTION_STATES.NONE:
		INTERACTION_STATES.FREEZE);
    }
    syncViewport(){	
	this.props.setViewportWH({
	    clientWidth:window.innerWidth,
	    clientHeight:window.innerHeight,
	});
    }
    handleScroll(event){
	this.zoomIn(-1 * event.deltaY,event);
    }    
    handleResize(event){	
	this.syncViewport();
    }
    panRight(dx){
	var {x0,y0} = this.props.viewport;
	x0+=dx;
	this.props.setViewportXY({x0,y0});
    }
    panUp(dy){
	var {x0,y0} = this.props.viewport;
	y0+=dy;
	this.props.setViewportXY({x0,y0});
    }
    centerView(){
	var {x0,y0,zoom,clientWidth,clientHeight} = this.props.viewport;
	this.props.setViewportXY({x0:-1*clientWidth/2/zoom,
				  y0:-1*clientHeight/2/zoom});
    }
    
    handleKeyDown(event) {
	if (event.keyCode === 37){this.panRight(-30 / this.props.app.transform.a);}
	if (event.keyCode === 38){this.panUp(-30 / this.props.app.transform.d);}
	if (event.keyCode === 39){this.panRight(30 / this.props.app.transform.a);}
	if (event.keyCode === 40){this.panUp(30 / this.props.app.transform.d);}
	if (event.keyCode === 187){this.zoomIn(300);}
	if (event.keyCode === 189){this.zoomIn(-300);}
    }
    
    exportPng(){
	var backend = this.backend_ref.current;
	var rcanvas = backend.getStorageCanvas();

	var export_canvas = ReactDOM.findDOMNode(this.export_canvas_ref.current);

	export_canvas.width=2000;
	export_canvas.height=2000;
	export_canvas.getContext("2d").drawImage(rcanvas,0,0,export_canvas.height,export_canvas.width);
	
	var data =  export_canvas.toDataURL( "image/jpeg" ,.5);	
	var link = document.createElement("a");
	link.download = "slide.jpg";
	link.href = data;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
    }

    drawFromBuffer(child_context,block_render = false){
	var {x0,y0,zoom,clientWidth,clientHeight} = this.props.viewport;
	var backend = this.backend_ref.current;
	var image_canvas = backend.getImage(x0,
					    y0,
					    x0+clientWidth / zoom ,
					    y0+clientHeight / zoom ,
					    clientWidth,clientHeight,
					    block_render);
	if (image_canvas){
	    child_context.setTransform(1,0,0,1,0,0);
	    child_context.clearRect(-5000,-5000,10000,10000);
	    child_context.drawImage(image_canvas,0,0);
	} else {
	    console.log("no image, skipping draw");
	}
    }

    forcedRefresh(){
	if (!this.view_ref.current){return null;}
	var view =  this.view_ref.current.getWrappedInstance();
	var context = view.getContext();
	this.drawFromBuffer(context,true);
    };

    onMouseMove(event){
	if(this.props.selection.select_type==INTERACTION_STATES.FREEZE){ return}
	
	var {x0,y0,zoom,clientWidth,clientHeight } = this.props.viewport;
	this.props.setMouse({nx:event.clientX / clientWidth,
			     ny:event.clientY / clientHeight});
	
	this.props.setSelectType(INTERACTION_STATES.HOVER);
	var dataX = this.props.mouse.nx*(clientWidth / zoom) + x0;
	var dataY = this.props.mouse.ny*(clientHeight / zoom) + y0;



	var n1 = this.dataset.nearest(dataX,dataY,.25);
	if(n1){
	    const new_idx = n1.idx;
	    if (this.props.selection.select_umi_idx != new_idx){
		this.props.setSelectUmiIdx(new_idx);
	    }
	} else {
	    this.props.setSelectUmiIdx(null);
	}
    }

    getMouseXY(){
	var {nx,ny} = this.props.mouse;
	var {x0,y0,zoom,clientWidth,clientHeight} = this.props.viewport;

	return {x:nx * clientWidth / zoom + x0,
		y:ny * clientHeight / zoom + y0};

    }
    
    zoomIn(dz, event = null){
	var {x0,y0,zoom,clientWidth,clientHeight} = this.props.viewport;
	var {nx,ny} = this.props.mouse;
	var z_new = Math.max(10,zoom*(1+dz / 1000));

	var x0_new = nx * clientWidth * (1/zoom  - 1/z_new) + x0;
	var y0_new = ny * clientHeight * (1/zoom - 1/z_new) + y0;

	this.props.setViewportTransform({
	    x0:x0_new,
	    y0:y0_new,
	    zoom:z_new,
	});
    }
    render(props){
	let main;
	if(this.state.dataset_fetched_name){
	    main = <span>
		<ExportCanvas ref={this.export_canvas_ref}/>
		<TwoModeCanvas
	    ref={this.backend_ref}
	    markFresh={this.forcedRefresh.bind(this)}
	    dataset={this.dataset}
		/>
		<MultiResView
	    onMouseMove={this.onMouseMove.bind(this)}
	    onMouseEnter={this.onMouseEnter.bind(this)}
	    onMouseLeave={this.onMouseLeave.bind(this)}
	    onKeyDown={this.bound_keydown}
	    onWheel={this.bound_wheel}
	    drawFromBuffer={this.drawFromBuffer.bind(this)}
	    bufferReady={true}
	    clickFun={this.bound_click}
	    dataset={this.dataset}
	    ref={this.view_ref}
		/>

		<OverlayControls
	    centerView={this.centerView.bind(this)}
	    zoomIn={this.zoomIn.bind(this)}
	    panRight={this.panRight.bind(this)}
	    panUp={this.panUp.bind(this)}
		/>
		
	    {this.props.selection.select_type==INTERACTION_STATES.FREEZE&&this.props.selection.select_umi_idx!=null?
	     <ModalSelectionContainer
	     dataset={this.dataset}
	     selected_idx={this.props.selection.select_umi_idx}
	     close={()=>{
		 this.props.setSelectType(INTERACTION_STATES.NONE);
	     }}/>:
	     null}
	    </span>;


	} else{
	    main=<LoadingScreen>
		
		<h1>Loading Dataset, {this.props.which_dataset}</h1>
		<ProgressContainer progress={this.state.loading_progress}><span className="fill" ></span><div className="message">{this.state.loading_status}</div></ProgressContainer>
		
	    </LoadingScreen>;
	}
	
	return (
	    <div className="fov fov-black">
	      {main}
	      <DebugConsole bg={this.state.debug_bg}>
		<table>
		  <tbody>
		    <tr><td>mouse coords: </td><td>{this.getMouseXY().x +", "+ this.getMouseXY().y}</td></tr>
		    <tr><td>x0, y0: </td><td>{this.props.viewport.x0 + ", " + this.props.viewport.y0}</td></tr>
		  </tbody>
		</table>
		<button onClick={this.resetDataset.bind(this)}>RESET DATASET</button>
		<button onClick={this.exportPng.bind(this)}>EXPORT PNG</button>
	      </DebugConsole>
	    </div>);	
    }
}



function mapStateToProps( { dataset, app, view, backend, mouse, viewport, selection ,datasets} ) {
    return { dataset, app, view , backend, mouse, viewport, selection, datasets };
}

export default connect(mapStateToProps, { setMouse,setViewportTransform, setViewportWH, setSelectUmiIdx, setSelectType , setViewportXY, registerImageContainer ,activateModal} )(DatasetContainer);



const LoadingScreen=styled.div`
left:50%;
top:50%;
position:absolute;
transform: translate(-50%, -50%);
`;

const ExportCanvas=styled.canvas`
display:none;
`


const ProgressContainer=styled.div`
position:relative;
height:40px;
width:100%;
border:2px solid;
border-radius:3px;

.fill{
background-color:rgba(0,0,255,.5);
height:100%;
position:absolute;
left:0px;
top:0px;
bottom:0px;
points-events:none;
right:${props => 100 - props.progress}%;
}
.message{
left:50%;
top:50%;
transform:translate(-50%, -50%);
position:absolute;
}
`;

const DebugConsole=styled.div`
display:none;
position:fixed;
left:0px;
bottom:0px;
margin:0px;
z-index:1000;
padding:20px;
background-color:${props =>props.bg?props.bg:"red"};
`;



const HeadsUpStyled = styled.div`
    position:fixed;
    bottom:0px;
    right:0px;
    margin-bottom:40px;
    margin-right:40px;
    width:400px;
    text-align:left;
    background-color:black;
    padding:20px;
`;
