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
	var sel = this.props.dataset.umis[this.props.selected_idx];
	var x0 = sel.x - 2;
	var y0 = sel.y - 2;
	var x1 = sel.x + 2;
	var y1 = sel.y + 2;

	this.range = {x0,y0,x1,y1};
	this.data_subset = this.props.dataset.getSubset(x0,y0,x1,y1);
	this.selected = sel;
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
	return(
	    <ModalSelectionComponent>
	      <div className="overlay" onClick={this.props.close}></div>
	      <div className="content">
		<div className="info">
		  <ul>
		    <li><span className="title">X:</span><span>{this.selected.x}</span></li>
		    <li><span className="title">Y:</span><span>{this.selected.y}</span></li>
		    <li><span className="title">sequence:</span><span><div className="seq">{this.selected.seq}</div></span></li>
		    <li><span className="title">metadata:</span><span>{JSON.stringify(this.selected.metadata?this.selected.metdata:{})}</span></li>
		  </ul>
		</div>
		<div className="canvas">
		  <StaticView ref={this.view_ref}
			      canvas_height={this.canvas_height}
			      canvas_width={this.canvas_width}/>
		  <SvgSelectionView umis={[this.selected]}
				    x0={this.range.x0}
				    y0={this.range.y0}
				    x1={this.range.x1}
				    y1={this.range.y1}
				    />
		</div>
		<TwoModeCanvas
		   ref={this.backend_ref}
		   markFresh={this.forcedRefresh.bind(this)}
		   dataset={this.data_subset}
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
	console.log("created view")
    }

    componentDidMount(){
	console.log("mounted child");
    }
    
    getContext(){
	return this.getCanvas().getContext('2d');
    }

    getCanvas(){
	return  ReactDOM.findDOMNode(this.canvas_ref.current);
    }
    render(){
	console.log("rendered view")

	return (<canvas ref={this.canvas_ref} width={this.props.canvas_width} height={this.props.canvas_height}/>);
    }
}
