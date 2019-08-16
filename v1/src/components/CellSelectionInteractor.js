import React, { Component } from "react";
import styled, { css } from "styled-components";
import { setSelectionTime } from "../actions";
import { connect } from "react-redux";
import _ from "lodash";
import SandBox from "../sandbox"


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



	  render() {
		const  view_width =  (this.props.viewbounds.x1 - this.props.viewbounds.x0)
		console.log((this.state.umis_in_view!=null) &( this.state.mouse!=null))
		window.current_interactor = this

		
		const x0 = 0;
		const y0 = 0;
		const x1 = 100;
		const y1 = 100;
		return (
			<StyledCellSelectionInteractor>
		  <svg
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
					fill="white"
					stroke="none"
				
					> </circle>
			)
			:""}

		  </svg>
		  <span className="cell-canvas">
		  <SandBox xyPoints={xyPoints}
		  x0={x0}
		  y0={y0}
		  x1={x1}
		  y1={y1}></SandBox>
		  </span>

		  </StyledCellSelectionInteractor>

		);
	  }

}



const xyPoints =[[ 78.5,  42.7],
[ 76.5,  55.3],
[ 87.5,  33.3],
[ 84.6,  30.2],
[ 79.4,  41.9],
[ 94.7,  39.1],
[ 70.6,  46.4],
[ 74.7,  30.2],
[ 83.2,  42. ],
[ 68.8,  45.2],
[ 83.4,  35.5],
[ 90.4,  17.3],
[ 82.2,  13.8],
[ 81. ,  42.9],
[ 82.3,  21. ],
[ 90.1,  32.4],
[ 70.9,  46.6],
[ 81.9,  39.2],
[ 77.8,  42.4],
[ 81. ,  46.1],
[ 81.6,  41.9],
[ 79.9,  44.9],
[ 65.8,  47.9],
[ 80.3,  46.8],
[ 79.3,  43.1],
[ 87.9,  40.6],
[ 83.5,  28.5],
[ 80.9,  43.2],
[ 79.3,  44.1],
[ 76. ,  51. ],
[ 73.2,  46.1],
[ 88. ,  18.3],
[100. ,  42.6],
[ 85.3,  41.3],
[ 79.8,  31.5],
[ 79.7,  42.6],
[ 74. ,  45.2],
[ 80.5,  45.7],
[ 75.5,  42.5],
[ 76.1,  50.1],
[ 80.4,  43.2],
[ 78.7,  45.8],
[  0. ,   0. ],
[ 37.9, 100. ],
[ 72.2,  54.6],
[ 81.4,  39.8],
[ 79.7,  43.9],
[ 81.9,  42.6],
[ 77.9,  34. ],
[ 76.8,  51.2],
[ 82.5,  36.5],
[ 72.7,  32.5],
[ 67.5,  37.6],
[ 79.9,  42. ],
[ 70.8,  51.9],
[ 85. ,  20.6],
[ 70.4,  45. ],
[ 74.7,  46.2],
[ 77.1,  53.9],
[ 87.2,  27.8],
[ 81.7,  40.2],
[ 92.1,  14.9],
[ 77.3,  45.6],
[ 90.4,  17. ],
[ 77.8,  53.7],
[ 80. ,  43.2],
[ 80.8,  47.1],
[ 86.4,  41.8],
[ 77.7,  41.3],
[ 75.8,  36.9],
[ 73.6,  45.8],
[ 79.4,  59.2],
[ 80. ,  42.2],
[ 81.2,  43.6],
[ 76.2,  48.3],
[ 76.4,  54.4],
[ 76.4,  49.3],
[ 80.2,  43.4],
[ 79.2,  42.7],
[ 81.4,  43.3],
[ 81.5,  54.4],
[ 81.1,  46.3]]


function mapStateToProps({app}){return {app};}
//export default connect(mapStateToProps)(DatasetListItem); 


export default connect(({app}) => { return {app};},
	{ setSelectionTime }
  )(CellSelectionView);
  
  
  const StyledCellSelectionInteractor = styled.div`

  .cell-canvas{
  background-color: transparent;
  /* z-index: 100; */
  position: absolute;
  width: 60vw;
  height: 60vh;
  left: 0px;
  top: 0px;
  border:1px solid white;
}
  svg{
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
				fill:white;
			}

	}
}
  `;