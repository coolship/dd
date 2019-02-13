import React, { Component } from 'react';
import ReactDOM from "react-dom";
import Modal from 'react-modal';
import _ from "lodash";
import styled, { css } from 'styled-components';

//REDUX ACTIONS
import SvgSelectionView from "./SvgSelectionView";
import { connect } from "react-redux";
import {MODALS} from "../layout";
import {closeModal} from "../actions";
import TwoModeCanvas from "./TwoModeCanvas";
import RenderContainer from "./RenderContainer";

export default class ModalSelectionContainer extends RenderContainer{
    constructor(props){
	//view and backend refsare created in super
	super(props);

	

	var selected = _.map(this.props.selected_list,
			     (e,i)=>{
				 return this.props.dataset.umis[e];
			     });
		
	
	const min_x = _.reduce(selected,(memo,next)=>{return Math.min(memo,next.x);},Infinity);
	const max_x = _.reduce(selected,(memo,next)=>{return Math.max(memo,next.x);},-Infinity);
	const min_y = _.reduce(selected,(memo,next)=>{return Math.min(memo,next.y);},Infinity);
	const max_y = _.reduce(selected,(memo,next)=>{return Math.max(memo,next.y);},-Infinity);
	
	var x0 = min_x - 2;
	var y0 = min_y - 2;
	var x1 = max_x + 2;
	var y1 = max_y + 2;

	this.range = {x0,y0,x1,y1};
	//this.data_subset = this.props.dataset.getSubset(x0,y0,x1,y1);
	this.selected = selected;
	this.canvas_width=400;
	this.canvas_height=400;
    }
    drawFromBuffer(block_render = false){
	var view = this.view_ref.current;
	var child_context = view.getContext();
	var backend = this.backend_ref.current;
	var image_canvas = backend.getImage(this.range.x0,
					    this.range.y0,
					    this.range.x1,
					    this.range.y1,
					    this.canvas_width,this.canvas_height,
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
	this.drawFromBuffer(true);
    };
    
    render(){
	let info;
	if(this.selected.length ==1){
	    info = (	<ul>
			<li><h1>TRANSCRIPT VIEWER</h1></li>
			<li>Viewing one  UMI-barcoded RNA transcript corresponding to gene {this.selected[0].typeName()} at X={this.selected[0].x}, Y={this.selected[0].y}. All spatial information information displayed in the DNA Microscopy assay is generated from UEI counts between observed transcripts.</li>
			<li><span className="title">Transcript sequence:</span><span><div className="seq">{this.selected[0].seq}</div></span></li>
			</ul>);
	} else {


	    var obj =_.map(this.selected,(e,i)=>{return ">"+e.idx +" "+ e.typeName() + " at ("+e.x+","+e.y+")"+"\n"+e.seq+"\n";}).join("");
	    var data = "text/plain;charset=utf-8," + encodeURIComponent(obj);	    
	    info = (<ul>
		    <li><h1>CELL SEGMENT VIEWER</h1></li>
		    <li>Selected { this.selected.length } transcripts, comprising a segmented cell. This segmentation is produced by iterative min-cut on transcript adjacency with a stopping condition [XXX] and may be a useful proxy for spatial colocalization of transcripts in cells. All spatial information and clustering is generated from UEI counts between observed transcripts.</li>
		    <li></li>
		    <li>For full transcript identities and sequence information, <a href={"data:" + data} download="sequences.txt">download this cell as a fasta file</a>.</li>
		    </ul>);

	}
	return(
	    <ModalSelectionComponent>
	      <div className="overlay" onClick={this.props.close}></div>
	      <div className="content">
		<div className="info">
		  {info}
			  
		</div>
		<div className="canvas">
		  <StaticView ref={this.view_ref}
			      canvas_height={this.canvas_height}
			      canvas_width={this.canvas_width}/>
		  <SvgSelectionView umis={this.selected}
				    x0={this.range.x0}
				    y0={this.range.y0}
				    x1={this.range.x1}
				    y1={this.range.y1}
				    hull={this.selected.length >2}
				    />
		</div>		
		<TwoModeCanvas
		   ref={this.backend_ref}
		   markFresh={this.forcedRefresh.bind(this)}
		   dataset={this.props.dataset}
		   color_config={{}}
		   />
	      </div>
	    </ModalSelectionComponent>
	);
    }
    componentDidMount(){
	this.drawFromBuffer();
    }
    componentDidUpdate(){
	this.drawFromBuffer();
    }
}

const ModalSelectionComponent=styled.div`
.overlay{
position:fixed;
left:0px;
top:0px;
right:0px;
bottom:0px;
background-color:rgba(0, 0, 0, .75);
}

.content{
position:fixed;
right:0%;
margin-right:50px;
top:50%;
transform:translate(0%, -50%);
width:400px;
height:400px;
border:2px solid;
border-radius:3px;
background-color:black;

.info{
width:350px;
right:100%;
position:absolute;
margin-right:20px;
font-family:courier;
text-align:left;
.seq{
max-width:100%;
box-sizing:border-box;
display:relative;
margin-left:20px;
margin-right:20px;
word-break: break-all;
}
li{list-style:none;}

}
}
`;


class StaticView extends Component{
    constructor(props){
	super(props);
	this.canvas_ref=React.createRef();
    }
    getContext(){
	return this.getCanvas().getContext('2d');
    }
    getCanvas(){
	return  ReactDOM.findDOMNode(this.canvas_ref.current);
    }
    render(){
	return (
	    <canvas style={{opacity:.25}} ref={this.canvas_ref} width={this.props.canvas_width} height={this.props.canvas_height}/>
	);
    }
}
