import React, { Component } from "react";
import styled, { css } from "styled-components";
import { setSelectionTime } from "../actions";
import { connect } from "react-redux";
import _ from "lodash";
import SandBox from "../sandbox"
import Close from "react-icons/lib/md/close";

import * as d3 from "d3";


class CellSelectionView extends Component {
	constructor(props) {
	  super(props);
	  this.state = { mouse: null, dragging: false };
	}
	componentDidMount(){
		this.queryCellsInView()
		
	}

	queryCellsInView(){
		var backend_address = this.props.app.backend_address

		this.state.mouse
		fetch(backend_address+ "segmentations/"+this.props.which_dataset+
			`/segments_by_xy/?`+
			`x0=${this.props.viewbounds.x0}&x1=${this.props.viewbounds.x1}&`+
			`y0=${this.props.viewbounds.y0}&y1=${this.props.viewbounds.y1}`).then((response)=>{
				return response.json()
			}).then(
				myJson=>
				this.setState(
					{"umis_in_view":
					_.map(myJson,(e,k)=>this.props.dataset.umisInSegment(e.id)).flat()})	
				)
	}

	getCellsInView(){
		this.setState({segments:this.props.dataset.getSegmentsInRange(
			this.props.dataset.viewbounds.x0,
			this.props.dataset.viewbounds.y0,
			this.props.dataset.viewbounds.x1,
			this.props.dataset.viewbounds.y1)})
	}


	getCellsInSelection(){
		var backend_address = this.props.app.backend_address

		this.state.mouse
		fetch(backend_address+ "segmentations/"+this.props.which_dataset+
			`/segments_by_xy/?`+
			`x0=${this.props.viewbounds.x0}&x1=${this.props.viewbounds.x1}&`+
			`y0=${this.props.viewbounds.y0}&y1=${this.props.viewbounds.y1}`).then((response)=>{
				return response.json()
			}).then(
				myJson=>
				this.setState(
					{"umis_in_view":
					_.map(myJson,(e,k)=>this.props.dataset.umisInSegment(e.id)).flat()})	
				)
	}

	cellClicked(ev){
		//var  seg = this.dataset.getSegmentById(int(ev.target.getAttribute("segmentid")))
		this.setState({cell_selected:Number(ev.target.getAttribute("segmentid"))})
	}


	getMouseXY(ev) {
		var { x0, y0, x1, y1 } = this.props.viewbounds;
		var nx = ev.clientX / this.svg_ref.clientWidth;
		var ny = ev.clientY / this.svg_ref.clientHeight;
	
		var mouse = {
		  x: nx * (x1 - x0) + x0,
		  y: ny * (y1 - y0) + y0
		};
		return mouse;
	  }
	  mouseMove(ev) {
		const {x,y} = this.getMouseXY(ev)
		this.setState({ mouse: this.getMouseXY(ev) });
		//var best_cell = this.props.dataset.getBestCell(x,y)
		//this.setState({cell_selected:best_cell})
	  }
	  mouseUp(ev) {
		this.setState({ dragging: "false", mouse_end: this.getMouseXY(ev) });
	  }
	  mouseDown(ev) {
		this.setState({
		  dragging: "true",
		  mouse_end: null,
		  mouse_start: this.getMouseXY(ev),
		  mouse: this.getMouseXY(ev)
		});
	  }

	  deselectCell(){

		this.setState({cell_selected:null})
	  }

	  render() {
		  
		const  view_width =  (this.props.viewbounds.x1 - this.props.viewbounds.x0)
		window.current_interactor = this

		

		var canvas_window = null;
		if(this.state.cell_selected){

			const cX0 =(this.props.viewbounds.x0 + this.props.viewbounds.x1) / 2
			const cY0 =(this.props.viewbounds.y0 + this.props.viewbounds.y1) / 2
			
			const cX =50// (this.props.viewbounds.x0 + this.props.viewbounds.x1) / 2
			const cY =50// (this.props.viewbounds.y0 + this.props.viewbounds.y1) / 2
			const width = 5  // (this.props.viewbounds.x1 - this.props.viewbounds.x0)
			const height = width // (this.props.viewbounds.y1 - this.props.viewbounds.y0)

			var xyUmis = _.map(this.props.dataset.umisInSegment(this.state.cell_selected),(u,i)=>[u.x,u.y ])
			var thisPointsUmap=  _.map(this.props.dataset.umisInSegment(this.state.cell_selected),(u,i)=>[u.umap_x,u.umap_y,u.umap_z ])

			var other_segs = this.props.dataset.getSegmentsInRange(
				this.props.viewbounds.x0,
				this.props.viewbounds.y0,
				this.props.viewbounds.x1,
				this.props.viewbounds.y1).filter(e=>e.eval0>0).slice(0,5)

			

			var other_umis = other_segs.map(   (e,i)=>this.props.dataset.umisInSegment(e.id))


			const max_segment = _.max(other_segs.map((e)=>e.id))
		
			var seed = 1;
			function seeded_random() {
				var x = Math.sin(seed++) * 10000;
				return x - Math.floor(x);
			}
			const colors = _.map(_.range(max_segment + 1), (i) => [(seeded_random()),
				(seeded_random()),
				(seeded_random())
			]);
	


			var other_coords = other_umis.map((l,i1)=>l.map( (u,i)=>[u.x,u.y]))
			var other_umap_coords = other_umis.map((l,i1)=>l.map( (u,i)=>[u.umap_x,u.umap_y,u.umap_z]))
			var other_colors = other_umis.map((l,i1)=>l.map( (u,i)=>[colors[u.db_seg][0],colors[u.db_seg][1],colors[u.db_seg][2]]))
			


			window.other_segs = other_segs
			window.other_umis = other_umis
			window.other_colors = other_colors
			window.other_umap_coords = other_umap_coords
			window.xyUmis = xyUmis

			canvas_window = <SandBox 
			mainPoints={xyUmis}
			otherPointsList={other_coords}
			otherUmapCoords={other_umap_coords}
			otherColors={other_colors}
			thisPointsUmap={thisPointsUmap}
			cX={cX0}
			cY={cY0}
			width={width}></SandBox>
		}


		return (
			<StyledCellSelectionInteractor className={canvas_window!=null?"has-canvas":"no-canvas"}>
		  <svg
		  className="main-svg"
			viewBox={
			  "" +
			  this.props.viewbounds.x0 +
			  " " +
			  this.props.viewbounds.y0 +
			  " " +
			  (this.props.viewbounds.x1 - this.props.viewbounds.x0) +
			  " " +
			  (this.props.viewbounds.y1 - this.props.viewbounds.y0)
			}
			ref={input => {
			  this.svg_ref = input;
			}}
			onMouseMove={this.mouseMove.bind(this)}
			onMouseDown={this.mouseDown.bind(this)}
			onMouseUp={this.mouseUp.bind(this)}
		  >
			{this.state.mouse_start ? (
			  this.state.mouse_end ? (
				<rect
				  x={Math.min(this.state.mouse_start.x, this.state.mouse_end.x)}
				  y={Math.min(this.state.mouse_start.y, this.state.mouse_end.y)}
				  width={Math.abs(
					this.state.mouse_end.x - this.state.mouse_start.x
				  )}
				  height={Math.abs(
					this.state.mouse_end.y - this.state.mouse_start.y
				  )}
				  stroke="white"
				  strokeWidth={0.001 * view_width}
				  fill="rgba(255, 255, 255, 0)"
				/>
			  ) : (
				<rect
				  x={Math.min(this.state.mouse_start.x, this.state.mouse.x)}
				  y={Math.min(this.state.mouse_start.y, this.state.mouse.y)}
				  width={Math.abs(this.state.mouse.x - this.state.mouse_start.x)}
				  height={Math.abs(this.state.mouse.y - this.state.mouse_start.y)}
				  stroke="blue"
				  strokeWidth={0.001}
				  fill="rgba(255, 255, 255, .3)"
				/>
			  )
			) : (
			  ""
			)}

			{this.props.dataset.getSegmentsInRange(
			this.props.viewbounds.x0,
			this.props.viewbounds.y0,
			this.props.viewbounds.x1,
			this.props.viewbounds.y1).filter(e=>e.eval0>0).map((e,i)=>
				<ellipse  className={"cell " + ((this.state.cell_selected==e.id)?"selected":"")}
				key={i}
				segment={e}
				segmentid={e.id}
				cx={e.meanx} 
				cy={e.meany} 
				rx={e.eval0}
				ry={e.eval1}
				strokeWidth={view_width/500}
				onClick={this.cellClicked.bind(this)}
				transform={`rotate(${Math.round((180 / Math.PI * Math.atan(e.evec0y/e.evec0x)))}, ${e.meanx}, ${e.meany})`}
				/>

			)}

			{this.state.cell_selected?
			_.map(
				this.props.dataset.umisInSegment(this.state.cell_selected),
				(u,i)=>
					<circle 
					key={i}
					cx = {u.x} 
					cy={u.y} 
					r = {view_width/100} 
					fill="transparent"
					stroke="rgba(255, 255, 255, .5)"
					strokeWidth={view_width/1000}
				
					> </circle>
			)
			:""}

		  </svg>
		  <span className="cell-canvas">
		  <Close
		  className="close-button"
      onClick={() => {this.deselectCell()}}
      style={{ 
		  width:"24px",height:"24px", position: "absolute", right: "0px", top: "0px",
		  border: "2px solid white",
		  borderRadius: "24px",
		  padding: "5px",
		  margin: "10px"}}
    />
				{canvas_window}
		  </span>

		  </StyledCellSelectionInteractor>

		);
	  }

}



function mapStateToProps({app}){return {app};}
//export default connect(mapStateToProps)(DatasetListItem); 


export default connect(({app}) => { return {app};},
	{ setSelectionTime }
  )(CellSelectionView);
  
  
  const StyledCellSelectionInteractor = styled.div`
  &.no-canvas{
	.cell-canvas{
display:none;
	}
}
  &.has-canvas{
	position: absolute;
	left: 0px;
	right: 0px;
	bottom: 0px;
	top: 0px;
	background:rgba(0,0,0,1);
	
	>:not(.cell-canvas){
		display:none;
	}
	
	ellipse{
		&.selected{
			fill:transparent;
			stroke:red;
		}
		&:not(.selected){
			fill:transparent;
			stroke:blue;
		}
	}

}

.close-button{
	cursor:pointer;
	&:hover{
		background-color:black;
		filter:invert(1);
	}

}
.cell-canvas{
	
	background-color: transparent;
	position: absolute;
	left:0px;
	top:0px;
	right:0px;
	bottom:0px;
	margin-top:50px;
	margin-bottom:100px;
	margin-left:10px;
	margin-right:10px;
	border:2px solid white;
	border-radius:10px;

	canvas{
		height:100%;
		width:100%;
	}

}
.main-svg{
	cursor:crosshair;
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0px;
	
	ellipse{
		
		cursor:pointer;
		fill:rgba(255, 255, 255, .3);
		stroke:rgba(255, 255, 255, .8);
		
		
		&:hover{
			fill:rgba(255, 255, 255, .5);
		}
		
		&.selected{
			fill:transparent;
			stroke:red;
		}
		
	}
}
`;