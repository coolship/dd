//react architecture
import React, { Component } from 'react';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';

import {makeTree, makePoints} from "./datafuns";

//actions
import { setSelectUmiIdx, setSelectType, setViewport, setMouse, resetApp, setViewportWH, setViewportTransform, setViewportXY, registerImageContainer} from "../actions";

//rendering tools
import initREGL from 'regl';
import _ from 'lodash';

//child components
import TwoModeCanvas from "./TwoModeCanvas";
import MultiResView from "./MultiResView";
import OverlayControls from "./OverlayControls";
import SelectionInfo from "./SelectionInfo";


//math tools
var knn = require('rbush-knn');
var pako = require('pako');



const INTERACTION_STATES={
    "NONE":0,
    "HOVER":1,
    "FREEZE":2
};

class DatasetContainer extends Component {

    //LIFECYCLE METHODS
    constructor(props){
	super(props);
	this.syncViewport();
	this.backend_ref=React.createRef();
	this.view_ref=React.createRef();
	this.needs_render=false;
	this.cooldown=null;
	this.full_cooldown=null;
	this.state= {
	    dataset_json_data:null,
	    dataset_umis_data:null,
	    dataset_types_data:null,
	    dataset_tree:null,
	    dataset_points:null,
	    progress:0,
	    fetching_dataset:false,
	    dataset_fetched_name:null,
	};


	
	this.bound_resize = this.handleResize.bind(this);
	this.bound_wheel = this.handleScroll.bind(this);
	this.bound_keydown = this.handleKeyDown.bind(this);
	

	this.requests = {};

	//register this image container for png export
	this.props.registerImageContainer(this);
    }

    hasUmis(){return this.state.dataset_umis_data!=null;}
    hasTypes(){return this.state.dataset_types_data!=null;}
    hasData(){return this.state.dataset_json_data!=null;}
    
    componentDidMount(){

	window.addEventListener("resize", this.bound_resize , false);
	window.addEventListener("wheel", this.bound_wheel , false);
	window.addEventListener('keydown', this.bound_keydown);

	this.fetchDataset(this.props.which_dataset);
    }

 

    shouldComponentUpdate(nextprops,nextstate){
	if(nextprops.which_dataset != nextstate.dataset_fetched_name){
	    if(!this.requests.json){
		nextstate.dataset_json_data=null;
		nextstate.dataset_umis_data=null;
		nextstate.dataset_types_data=null;
		nextstate.dataset_tree=null;
		nextstate.dataset_points=null;
		this.fetchDataset(nextprops.which_dataset);
	    }
	}
	return true;
    }
    

    computeDataState(){


    }
    
    
    fetchDataset(dataset_name) {
	const metadata = _.find(this.props.datasets,(d)=>d.dataset==dataset_name);
	this.requests.json = new XMLHttpRequest();
	var xhr = this.requests.json;
	//can also use xhr.responseType="blob";
	xhr.responseType = 'blob';
	xhr.acceptEncoding ="gzip";
	var that = this;
	
	xhr.onprogress =(snapshot)=> {
	    this.setState({
		progress:snapshot.loaded / snapshot.total * 100
	    });
	};
	
	xhr.onload = function(event) {
	    var blob = xhr.response;
	    var arrayBuffer;
	    var fileReader = new FileReader();
	    fileReader.onload = function(event) {
		arrayBuffer = event.target.result;
		try {
		    console.log("loaded file");
		    let result = pako.ungzip(new Uint8Array(arrayBuffer), {"to": "string"});
		    let jsondata = JSON.parse(result);
		    that.requests.json = null;

		    
		    if(metadata.types_url){
			var xhr3 = new XMLHttpRequest();
			xhr3.responseType = 'json';
			xhr3.onload = function(event) {
			    var types_json = xhr3.response;
			    var tree = makeTree(jsondata,types_json,null);
			    var points = makePoints(jsondata,types_json,null);
			    that.setState({dataset_json_data:jsondata,
					   dataset_fetched_name:metadata.dataset,
					   dataset_tree:tree,
					   dataset_points:points,
					   dataset_types_data:types_json,
					   progress:0,
					  });
			    
			};
			xhr3.open('GET', metadata.types_url);
			xhr3.send();
		    } else{
						    
			var tree = makeTree(jsondata,that.state.dataset_types_data,null);
			var points = makePoints(jsondata,that.state.dataset_types_data,null);
			
			that.setState({dataset_json_data:jsondata,
				       dataset_fetched_name:metadata.dataset,
				       dataset_tree:tree,
				       dataset_points:points,
				       progress:0,
				      });
			
		    }
		    
		} catch (err) {
		    console.log("Error " + err);
		}
	    };
	    fileReader.readAsArrayBuffer(blob);
	};
	xhr.open('GET', metadata.downloadUrl);
	xhr.send();


	/*	
	 var xhr2 = new XMLHttpRequest();
	//can also use xhr.responseType="blob";
	xhr2.responseType = 'json';
	xhr2.onload = function(event) {
	    var jsondata = xhr2.response;
	    this.setState({dataset_umis_data:jsondata});	    
	};
	xhr2.open('GET', metadata.umis_url);
	xhr2.send();
	 */


	 
    };



    componentWillUnmount(){

	console.log("unmouting");
	window.removeEventListener('wheel',this.bound_wheel);
	window.removeEventListener('keydown', this.bound_keydown);
	window.removeEventListener('resize', this.bound_resize);
    }
    onMouseEnter(event){
	if(this.props.selection.select_type==2){return;}
	this.props.setSelectType(1);	
    }
    onMouseLeave(event){
	if(this.props.selection.select_type==2){return;}
	this.props.setSelectType(0);
    }
    onClick(event){
	this.props.setSelectType(this.props.selection.select_type==2?0:2);
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

	console.log(x0,y0)
	
	
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
	var backend = this.backend_ref.current.getWrappedInstance();
	var rcanvas = backend.getStorageCanvas();
	var data =  rcanvas.toDataURL();	
	var link = document.createElement("a");
	link.download = "slide.png";
	link.href = data;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
    }

    drawFromBuffer(child_context,block_render = false){
	var {x0,y0,zoom,clientWidth,clientHeight} = this.props.viewport;
	var backend = this.backend_ref.current.getWrappedInstance();
	var dim = Math.max(clientWidth,clientHeight);
	var image_canvas = backend.getImage(x0,
					    y0,
					    x0+clientWidth / zoom ,
					    y0+clientHeight / zoom ,
					    clientWidth,clientHeight,
					    block_render);
	if (image_canvas){
	    child_context.setTransform(1,0,0,1,0,0);

	    child_context.clearRect(-5000,-5000,10000,10000);

	    //child_context.clearRect(0, 0,
	    //this.props.viewport.width,
	    //			  this.props.viewport.height);
	    
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
    }

    onMouseMove(event){
	if(this.props.selection.select_type==INTERACTION_STATES.FREEZE){ return}
	
	var {x0,y0,zoom,clientWidth,clientHeight } = this.props.viewport;
	this.props.setMouse({nx:event.clientX / clientWidth,
			     ny:event.clientY / clientHeight});

	return

	this.props.setSelectType(INTERACTION_STATES.HOVER);
	var dataX = this.props.mouse.nx*(clientWidth / zoom) + x0;
	var dataY = this.props.mouse.ny*(clientHeight / zoom) + y0;

	if(this.props.dataset.current_dataset){
	    var tree = this.props.dataset.current_dataset.tree;

	    console.time("knn");
	    var neighbors = knn(tree,dataX,dataY, 1);
	    if (neighbors.length >0){
		var n1 = neighbors[0];
		const new_idx = n1.idx;
		if (this.props.selection.select_umi_idx != new_idx){
		    console.log("setting new umi idx: ", new_idx);
		    this.props.setSelectUmiIdx(n1.idx);
		}
	    }
	    console.timeEnd("knn");
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
	var z_new = Math.max(5,zoom*(1+dz / 1000));
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
	if(this.state.dataset_json_data){
	    main = <span>
		<TwoModeCanvas
	    ref={this.backend_ref}
	    markFresh={this.forcedRefresh.bind(this)}
	    treeData={this.state.dataset_tree}
	    pointData={this.state.dataset_points}
		/>
		<MultiResView
	    onMouseMove={this.onMouseMove.bind(this)}
	    onMouseEnter={this.onMouseEnter.bind(this)}
	    onMouseLeave={this.onMouseLeave.bind(this)}
	    onClick={this.onClick.bind(this)}
	    drawFromBuffer={this.drawFromBuffer.bind(this)}
	    bufferReady={true}
	    ref={this.view_ref}
		/>
		<OverlayControls
	    centerView={this.centerView.bind(this)}
	    zoomIn={this.zoomIn.bind(this)}
	    panRight={this.panRight.bind(this)}
	    panUp={this.panUp.bind(this)}
		/>
	    </span>;

	} else{
	    main=<LoadingScreen>
		
		<h1>Loading Dataset, {this.props.which_dataset}</h1>
		<ProgressContainer progress={this.state.progress}><span className="fill" ></span></ProgressContainer>
		
	    </LoadingScreen>;
	}
	
	return (
	    <div className="fov fov-black">
	      {main}
	      <DebugConsole>
		<table>
		  <tbody>
		    <tr><td>mouse coords: </td><td>{this.getMouseXY().x +", "+ this.getMouseXY().y}</td></tr>
		    <tr><td>x0, y0: </td><td>{this.props.viewport.x0 + ", " + this.props.viewport.y0}</td></tr>
		  </tbody>
		</table>
	      </DebugConsole>
	    </div>);	
    }   
}



function mapStateToProps( { dataset, app, view, backend, mouse, viewport, selection ,datasets} ) {
    return { dataset, app, view , backend, mouse, viewport, selection, datasets };
}

export default connect(mapStateToProps, { setMouse,setViewportTransform, setViewportWH, setSelectUmiIdx, setSelectType , setViewportXY, registerImageContainer } )(DatasetContainer);



const LoadingScreen=styled.div`
left:50%;
top:50%;
position:absolute;
transform: translate(-50%, -50%);
`;

const ProgressContainer=styled.div`
position:relative;
height:40px;
width:100%;
border:2px solid;
border-radius:3px;

.fill{
background-color:blue;
height:100%;
position:absolute;
left:0px;
top:0px;
bottom:0px;
points-events:none;
right:${props => 100 - props.progress}%;
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
background-color:red;
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
