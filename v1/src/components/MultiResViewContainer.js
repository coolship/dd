//react architecture
import React, { Component } from 'react';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';


//actions
import { setSelectUmiIdx, setSelectType, setViewport, setMouse, resetApp, setViewportWH, setViewportTransform, setViewportXY, registerImageContainer,resetUIOnly} from "../actions";

//rendering tools
import initREGL from 'regl';
import _ from 'lodash';

//child components
import TwoModeCanvas from "./TwoModeCanvas";
import MultiResView from "./MultiResView";


//math tools
var knn = require('rbush-knn');


const INTERACTION_STATES={
    "NONE":0,
    "HOVER":1,
    "FREEZE":2
};

class MultiResViewContainer extends Component {

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
	    progress:0,
	    fetching_dataset:false,
	    dataset_fetched_name:null,
	};

	this.requests = {}

	//register this image container for png export
	this.props.registerImageContainer(this);
    }
    componentDidMount(){
	window.addEventListener("resize", this.handleResize.bind(this) , false);
	window.addEventListener("wheel", this.handleScroll.bind(this) , false);
	window.addEventListener('keydown', this.handleKeyDown.bind(this));

	this.fetchDataset();
    }

 

    shouldComponentUpdate(nextprops,nextstate){
	if(nextprops.which_dataset != nextstate.dataset_fetched_name){
	    if(!this.requests.json){
		nextstate.dataset_json_data=null;
		nextstate.dataset_umis_data=null;
		nextstate.dataset_types_data=null;
		this.fetchDataset();
	    }
	}
	return true
    }
    

    
    fetchDataset() {
	const metadata = _.find(this.props.datasets,(d)=>d.dataset==this.props.which_dataset);
	this.requests.json = new XMLHttpRequest();
	var xhr = this.requests.json;

	console.log("fetching dataset ", metadata.dataset);

	//can also use xhr.responseType="blob";
	xhr.responseType = 'json';
	var that = this;
	
	xhr.onprogress =(snapshot)=> this.setState({progress:this.state.progress+10});
	xhr.onload = function(event) {
	    var jsondata = xhr.response;
	    that.setState({dataset_json_data:jsondata,
			   dataset_fetched_name:metadata.dataset,
			   progress:0,
			  });
	    that.requests.json = null;
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

	var xhr3 = new XMLHttpRequest();
	//can also use xhr.responseType="blob";
	xhr3.responseType = 'json';
	xhr3.onload = function(event) {
	    var jsondata = xhr3.response;
	    
	    this.setState({dataset_types_data:jsondata});

	    
	};
	xhr3.open('GET', metadata.types_url);
	xhr3.send();  
	 */
    };



    
    componentWillUnmount(){
	window.removeEventListener('scroll', this.handleScroll);
	window.removeEventListener('keydown', this.handleKeyDown);
	window.removeEventListener('resize', this.handleResize);
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

    resetUI(){
	this.props.resetUIOnly();
    }
    
    drawFromBuffer(child_context,block_render = false){
	var {x0,y0,zoom,clientWidth,clientHeight} = this.props.viewport;
	var backend = this.backend_ref.current.getWrappedInstance();
	var dim = Math.max(clientWidth,clientHeight)
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
	var z_new = zoom*(1+dz / 1000);
	var x0_new = nx * clientWidth * (1/zoom  - 1/z_new) + x0;
	var y0_new = ny * clientHeight * (1/zoom - 1/z_new) + y0;
	this.props.setViewportTransform({
	    x0:x0_new,
	    y0:y0_new,
	    zoom:z_new,
	});	
    }
    render(props){

	console.log(this.props.dataset_name)
	let main;
	if(this.state.dataset_json_data){
	    main = <span>
		<TwoModeCanvas
		 ref={this.backend_ref}
		 markFresh={this.forcedRefresh.bind(this)}/>
		<MultiResView
		 onMouseMove={this.onMouseMove.bind(this)}
		 onMouseEnter={this.onMouseEnter.bind(this)}
		 onMouseLeave={this.onMouseLeave.bind(this)}
		 onClick={this.onClick.bind(this)}
		 drawFromBuffer={this.drawFromBuffer.bind(this)}
		 bufferReady={this.props.app.waiting_for_data?false:true}
		 ref={this.view_ref}
		/>
	    </span>;

	} else{
	    main=<LoadingScreen>
		<h1>Loading Dataset, {this.props.dataset_name}</h1>
		<ProgressContainer><span className="fill" width={this.state.progress+"%"}></span></ProgressContainer>
	    </LoadingScreen>;
	}
	
	return (
	    <div id="reglFov" className="fov fov-black" data-rendered_dataset_name="" ref={this.fov} data-dataset_name={this.props.dataset.current_dataset?this.props.dataset.current_dataset.metadata.dataset:"" } >
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

export default connect(mapStateToProps, { setMouse,setViewportTransform, setViewportWH, setSelectUmiIdx, setSelectType , setViewportXY, registerImageContainer, resetUIOnly } )(MultiResViewContainer);


const LoadingScreen=styled.div`
left:50%;
width:200px;
margin-top:200px;
position:relative;
`;

const ProgressContainer=styled.div`
position:relative;
height:40px;
width:100%;
border:2px solid;
border-radius:3px;

.fill{
background-color:green;
height:100%;
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
