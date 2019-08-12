import React, { Component } from "react";
import styled, { css } from "styled-components";
import { setSelectionTime } from "../actions";
import { connect } from "react-redux";



class CellSelectionView extends Component {
	constructor(props) {
	  super(props);
	  this.state = { mouse: null, dragging: false };
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
		this.setState({ mouse: this.getMouseXY(ev) });
	  }
	  mouseUp(ev) {
		var { x, y } = this.getMouseXY(ev);
	
		var x0 = Math.min(x, this.state.mouse_start.x);
		var y0 = Math.min(y, this.state.mouse_start.y);
		var x1 = Math.max(x, this.state.mouse_start.x);
		var y1 = Math.max(y, this.state.mouse_start.y);
	
		const query_val = JSON.stringify({x0,y0,x1,y1})
		const querystring = "http://35.237.243.111:5000/queries/xyrect/" + this.props.which_dataset + "/"
	
		const query_json_string = `${querystring}?xy_rect_json=${encodeURIComponent(query_val)}`
		const info = {
		  query_json_string,
		  query_val,
		  query_type:"xy_rect",
		  query_description:"X/Y position between",
		}

		console.log(
			"THIS IS WHEN WE WOULD RUN A QUERY"
		)
		//this.props.runQuery(info)
	
	
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
		return (
		  <SvgElement
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
		  </SvgElement>
		);
	  }

}




export default connect(
	({}) => {
	  return {};
	},
	{ setSelectionTime }
  )(CellSelectionView);
  
  
  const SvgElement = styled.svg`
  cursor:crosshair;
	width: 100%;
	height: 100%;
	position: absolute;
	left: 0px;
  `;