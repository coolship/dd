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
	

	console.log(selected)
	
	
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
			<li><span className="title">X:</span><span>{this.selected.length==1?this.selected[0].x:"multiple xvals"}</span></li>
			<li><span className="title">Y:</span><span>{this.selected.length==1?this.selected[0].y:"multiple yvals"}</span></li>
			<li><span className="title">sequence:</span><span><div className="seq">{this.selected.length==1?this.selected[0].seq:"multiple sequences. [TODO] DOWNLOAD FA"}</div></span></li>
			</ul>);
	} else {


	    var obj =_.map(this.selected,(e,i)=>{return ">"+e.idx +"_("+e.x+","+e.y+")"+"\n"+e.seq+"\n";}).join("");
	    var data = "text/plain;charset=utf-8," + encodeURIComponent(obj);	    
	    info = (<ul>
		    <li>{ this.selected.length } transcripts</li>
		    <li><a href={"data:" + data} download="sequences.txt">download fasta file</a></li>
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
background-color:rgba(0, 0, 0, .45);
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
width:200px;
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
	    <canvas ref={this.canvas_ref} width={this.props.canvas_width} height={this.props.canvas_height}/>
	);
    }
}
