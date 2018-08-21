//react architecture
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';
import {MODALS} from "../layout";


//actions
import { setSelectUmiIdx, setSelectType, setMouse, resetApp} from "../actions";
import { uploadPreview } from "../actions/FileIO";

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



const INTERACTION_STATES={
    "NONE":0,
    "HOVER":1,
    "FREEZE":2
};


class DatasetStageContainer extends RenderContainer {

    //LIFECYCLE METHODS
    constructor(props){
	super(props);
	this.state = {};
	
	this.bound_resize = this.handleResize.bind(this);
	this.bound_wheel = this.handleScroll.bind(this);
	this.bound_click = this.onClick.bind(this);
	this.bound_keydown = this.handleKeyDown.bind(this);
	this.export_canvas_ref=React.createRef();

    }

    getSize(){
	if(this.self_ref.current){
	    const self = ReactDOM.findDOMNode( this.self_ref.current);
	    return {width:self.offsetWidth,height:self.offsetHeight};
	} else {
	    return null;
	}
    }
    
    componentDidMount(){
	window.addEventListener("resize", this.bound_resize , false);
	const size = this.getSize();
	this.setState({
	    viewport:{
		clientWidth:size.width,
		clientHeight:size.height,
		x0:-1*size.width/2/20,
		y0:-1*size.height/2/20,
		zoom:20,
	    }
	}
		     );

    };    
    componentWillUnmount(){
	window.removeEventListener('resize', this.bound_resize);
    }
    onMouseEnter(event){
	if(this.props.selection.select_type==INTERACTION_STATES.FREEZE){return;}

	var {x0,y0,zoom,clientWidth,clientHeight } = this.state.viewport;
	this.props.setMouse({nx:event.clientX / clientWidth,
			     ny:event.clientY / clientHeight});

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
	var size=this.getSize();
	if (!size) return;
	this.setState({
	    viewport:Object.assign({},this.state.viewport,{
		clientWidth:size.width,
		clientHeight:size.height
	    })
	});
    }

    setViewportXY({x0,y0}){
	this.setState({
	    viewport:Object.assign({},this.state.viewport,{x0,y0})
	});
    }
    setViewportTransform({x0,y0,zoom}){
	this.setState({
	    viewport:Object.assign({},this.state.viewport,{x0,y0,zoom})
	});
    }
    
    handleScroll(event){
	this.zoomIn(-1 * event.deltaY,null);
    }    
    handleResize(event){	
	this.syncViewport();
    }
    panRight(dx){
	var {x0,y0} = this.state.viewport;
	x0+=dx;
	this.setViewportXY({x0,y0});
    }
    panUp(dy){
	var {x0,y0} = this.state.viewport;
	y0+=dy;
	this.setViewportXY({x0,y0});
    }
    centerView(){
	var {x0,y0,zoom,clientWidth,clientHeight} = this.state.viewport;
	this.setViewportXY({x0:-1*clientWidth/2/zoom,
				  y0:-1*clientHeight/2/zoom});
    }
    
    handleKeyDown(event) {
	if (event.keyCode === 37){this.panRight(-30 / this.state.viewport.zoom);}
	if (event.keyCode === 38){this.panUp(-30 / this.state.viewport.zoom);}
	if (event.keyCode === 39){this.panRight(30 / this.state.viewport.zoom);}
	if (event.keyCode === 40){this.panUp(30 / this.state.viewport.zoom);}
	if (event.keyCode === 187){this.zoomIn(300);}
	if (event.keyCode === 189){this.zoomIn(-300);}
    }
    
    exportPng(){
	const backend = this.backend_ref.current;
	const rcanvas = backend.getStorageCanvas();

	var export_canvas = ReactDOM.findDOMNode(this.export_canvas_ref.current);

	export_canvas.width=2000;
	export_canvas.height=2000;
	export_canvas.getContext("2d").drawImage(rcanvas,0,0,export_canvas.height,export_canvas.width);
	
	var data =  export_canvas.toDataURL( "image/jpeg" ,.75);	
	var link = document.createElement("a");
	link.download = "slide.jpg";
	link.href = data;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
    }

    choosePreview(){
	const backend = this.backend_ref.current;
	const rcanvas = backend.getStorageCanvas();
	var export_canvas = ReactDOM.findDOMNode(this.export_canvas_ref.current);

	export_canvas.width=600;
	export_canvas.height=600;
	export_canvas.getContext("2d").drawImage(rcanvas,0,0,export_canvas.height,export_canvas.width);
	export_canvas.toBlob((blob)=>{
	    uploadPreview(this.props.metadata_key,this.props.metadata,blob);
	}, 'image/jpeg', 0.95);
    }
    
    drawFromBuffer(child_context,block_render = false){
	var {x0,y0,zoom,clientWidth,clientHeight} = this.state.viewport;
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
	
	var {x0,y0,zoom,clientWidth,clientHeight } = this.state.viewport;
	this.props.setMouse({nx:event.clientX / clientWidth,
			     ny:event.clientY / clientHeight});
	
	this.props.setSelectType(INTERACTION_STATES.HOVER);
	var dataX = this.props.mouse.nx*(clientWidth / zoom) + x0;
	var dataY = this.props.mouse.ny*(clientHeight / zoom) + y0;



	var n1 = this.props.dataset.nearest(dataX,dataY,.25);
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
	var {x0,y0,zoom,clientWidth,clientHeight} = this.state.viewport;

	return {x:nx * clientWidth / zoom + x0,
		y:ny * clientHeight / zoom + y0};

    }
    
    zoomIn(dz, nxy ){
	var {x0,y0,zoom,clientWidth,clientHeight} = this.state.viewport;
	let {nx,ny} = nxy?nxy:this.props.mouse;
	var z_new = Math.max(10,zoom*(1+dz / 1000));

	var x0_new = nx * clientWidth * (1/zoom  - 1/z_new) + x0;
	var y0_new = ny * clientHeight * (1/zoom - 1/z_new) + y0;

	this.setViewportTransform({
	    x0:x0_new,
	    y0:y0_new,
	    zoom:z_new,
	});
    }
    render(props){
	;


	if(this.state.viewport){
	    
	
	return (
	    <div className="fov fov-black"
		 style={{
		     position:"absolute",
		     left:"0px",
		     top:"0px",
		     right:"0px",
		 bottom:"0px"}}
		 ref={this.self_ref}>
		  <CanvasContainer>
			<ExportCanvas ref={this.export_canvas_ref}/>
			    <TwoModeCanvas
				   ref={this.backend_ref}
				   markFresh={this.forcedRefresh.bind(this)}
				   dataset={this.props.dataset}
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
				       dataset={this.props.dataset}
				       ref={this.view_ref}
				       clientWidth={this.state.viewport.clientWidth}
				       clientHeight={this.state.viewport.clientHeight}
				       x0={this.state.viewport.x0}
				       y0={this.state.viewport.y0}
				       x1={this.state.viewport.x0+this.state.viewport.clientWidth/this.state.viewport.zoom}
				       y1={this.state.viewport.y0+this.state.viewport.clientHeight/this.state.viewport.zoom}
				       />

				    <OverlayControls
					   centerView={this.centerView.bind(this)}
					   zoomIn={this.zoomIn.bind(this)}
					   panRight={this.panRight.bind(this)}
					   panUp={this.panUp.bind(this)}
					   exportPng={this.exportPng.bind(this)}
					   is_demo={this.props.is_demo}
					   
					   />
					
					{this.props.selection.select_type==INTERACTION_STATES.FREEZE&&this.props.selection.select_umi_idx!=null?
					 <ModalSelectionContainer
						dataset={this.props.dataset}
						selected_idx={this.props.selection.select_umi_idx}
						close={()=>{
						    this.props.setSelectType(INTERACTION_STATES.NONE);
						}}/>:
					       null}
		      </CanvasContainer>
		      <DebugConsole>
			    <table>
				  <tbody>
					<tr><td>mouse coords: </td><td>{this.getMouseXY().x +", "+ this.getMouseXY().y}</td></tr>
					    <tr><td>x0, y0: </td><td>{this.state.viewport.x0 + ", " + this.state.viewport.y0}</td></tr>
				      </tbody>
				</table>
				<button onClick={this.exportPng.bind(this)}>EXPORT PNG</button>
				    <button onClick={this.choosePreview.bind(this)}>CHOOSE PREVIEW</button>
			  </DebugConsole>
		      
	    </div>);
	} else {
	    return(
		<div className="fov fov-black"
		     style={{
			 position:"absolute",
			 left:"0px",
			 top:"0px",
			 right:"0px",
		     bottom:"0px"}}
		     ref={this.self_ref}></div>
	    );
	}
    }
}



function mapStateToProps( { mouse, selection} ) {
    return {  mouse, selection };
}

export default connect(mapStateToProps, { setMouse, setSelectUmiIdx, setSelectType} )(DatasetStageContainer);



const CanvasContainer=styled.div`
width:100%;
height:100%;
position:absolute;
top:0px;
bottom:0px;
`

const ExportCanvas=styled.canvas`
display:none;
`



const DebugConsole=styled.div`
display:none;
position:fixed;
left:0px;
bottom:0px;
margin:0px;
z-index:1000;
padding:20px;
background-color:"red"};
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
