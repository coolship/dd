//react architecture
import React, { Component } from 'react';
import { connect } from "react-redux";

//actions
import { setSelectUmiIdx, setSelectType, setViewport, setMouse, resetApp, setViewportWH, setViewportTransform, setViewportXY} from "../actions";

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
	this.needs_render=false;
	this.cooldown=null;
	this.full_cooldown=null;
	/*this.state={
	    needs_render:false,
	    timeout:null,
	};*/
    }
    componentDidMount(){
	window.addEventListener("resize", this.handleResize.bind(this) , false);
	window.addEventListener("wheel", this.handleScroll.bind(this) , false);
	window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
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
    
    
    drawFromBuffer(child_context){



	const refresh_delay = 500;
	const full_refresh_delay = 3000;
	const that = this;

	if(this.cooldown==null){

	    console.time('render');
	    var {x0,y0,zoom,clientWidth,clientHeight} = this.props.viewport;
	    var backend = this.backend_ref.current.getWrappedInstance();

	    
	    var image_canvas = backend.getCanvasImage(x0,
						      y0,
						      x0+clientWidth / zoom ,
						      y0+clientHeight / zoom ,
						      clientWidth,
						      clientHeight);
	    if (image_canvas){
		child_context.drawImage(image_canvas,
					0,0, clientWidth,clientHeight,
					0,0, clientWidth,clientHeight);
	    } else {
		console.log("no image, skipping draw");
	    }

	    this.needs_render=false;
	    
	    this.cooldown = window.setTimeout( ()=>{
		console.log(that.cooldown);
		that.cooldown=null;
		if(that.needs_render){
		    that.drawFromBuffer(child_context);
		};
	    }, refresh_delay);


	    console.timeEnd('render');
	    
	}else{
	    
	    this.needs_render = true;
	}
    }
    onMouseMove(event){
	if(this.props.selection.select_type==INTERACTION_STATES.FREEZE){ return}

	return;
	
	var {x0,y0,zoom,clientWidth,clientHeight } = this.props.viewport;
	this.props.setMouse({nx:event.clientX / clientWidth,
			     ny:event.clientY / clientHeight});
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
	return (
	    <div id="reglFov" className="fov fov-black" data-rendered_dataset_name="" ref={this.fov} data-dataset_name={this.props.dataset.current_dataset?this.props.dataset.current_dataset.metadata.dataset:"" } >
	      <TwoModeCanvas ref={this.backend_ref}/>
	      <MultiResView
		 onMouseMove={this.onMouseMove.bind(this)}
		 onMouseEnter={this.onMouseEnter.bind(this)}
		 onMouseLeave={this.onMouseLeave.bind(this)}
		 onClick={this.onClick.bind(this)}
		 drawFromBuffer={this.drawFromBuffer.bind(this)}
		 bufferReady={this.props.app.waiting_for_data?false:true}
		 />
	    </div>);	
    }   
}



function mapStateToProps( { dataset, app, view, backend, mouse, viewport, selection } ) {
    return { dataset, app, view , backend, mouse, viewport, selection };
}

export default connect(mapStateToProps, { setMouse,setViewportTransform, setViewportWH, setSelectUmiIdx, setSelectType , setViewportXY } )(MultiResViewContainer);

