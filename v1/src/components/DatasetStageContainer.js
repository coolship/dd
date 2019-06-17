//react architecture
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';
import { MODALS } from "../layout";


//actions
import { uploadPreview } from "../actions/FileIO";

//rendering tools
import initREGL from 'regl';
import _ from 'lodash';

//child components
import TwoModeCanvas from "./TwoModeCanvas";
import TwoModeSlicedCanvas from "./TwoModeSlicedCanvas";

import MultiResView from "./MultiResView";
import OverlayControls from "./OverlayControls";

import SelectionInfo from "./SelectionInfo";
import ModalSelectionContainer from "./ModalSelectionContainer";
import RenderContainer from "./RenderContainer";
import TranscriptSelectionInteractor from "./TranscriptSelectionInteractor";
import CellSelectionInteractor from "./CellSelectionInteractor";
import DragInteractor from "./DragInteractor";



const INTERACTION_STATES = {
	"NONE": 0,
	"HOVER": 1,
	"FREEZE": 2,
	"DRAGGING": 3,
};


function preventDefault(e) {
	e = e || window.event;
	if (e.preventDefault)
	e.preventDefault();
	e.returnValue = false;
}


class DatasetStageContainer extends RenderContainer {
	
	//LIFECYCLE METHODS
	constructor(props) {
		super(props);
		this.state = {
			interactionMode: "drag", // allowable: "select", "cell", "drag", "analyze"
			selection: { selected_idxs: [], select_type: null },
		};
		
		this.bound_resize = this.handleResize.bind(this);
		this.bound_wheel = this.handleScroll.bind(this);
		this.bound_click = this.onClick.bind(this);
		this.bound_mousedown = this.mouseDown.bind(this);
		this.bound_mouseup = this.mouseUp.bind(this);
		
		this.bound_keydown = this.handleKeyDown.bind(this);
		this.export_canvas_ref = React.createRef();
		
	}
	
	getSize() {
		if (this.self_ref.current) {
			const self = ReactDOM.findDOMNode(this.self_ref.current);
			return { width: self.offsetWidth, height: self.offsetHeight };
		} else {
			return null;
		}
	}
	
	componentDidMount() {
		window.addEventListener("resize", this.bound_resize, false);
		const size = this.getSize();
		this.setState({
			viewport: {
				clientWidth: size.width,
				clientHeight: size.height,
				x0: -1 * size.width / 2 / 20,
				y0: -1 * size.height / 2 / 20,
				zoom: 20,
			}
		}
		);
		
	};
	componentWillUnmount() {
		window.removeEventListener('resize', this.bound_resize);
	}
	
	setSelectType(val) {
		this.setState({ selection: Object.assign({}, this.state.selection, { select_type: val }) });
	}
	
	setSelectUmiIdx(val) {
		if (val) {
			this.setState({ selection: Object.assign({}, this.state.selection, { selected_idxs: [val] }) });
		} else {
			this.setState({ selection: Object.assign({}, this.state.selection, { selected_idxs: [] }) });
		}
	}
	setSelectManyIdxs(idxs) {
		if (idxs) {
			this.setState({ selection: Object.assign({}, this.state.selection, { selected_idxs: idxs }) });
		} else {
			this.setState({ selection: Object.assign({}, this.state.selection, { selected_idxs: [] }) });
			
		}
	}
	
	getFirstSelected() {
		if (this.state.selection.selected_idxs && this.state.selection.selected_idxs.length > 0) {
			return this.state.selection.selected_idxs[0];
		} else {
			return null;
		}
	}
	getAllSelected() {
		if (this.state.selection.selected_idxs) {
			return this.state.selection.selected_idxs;
		} else {
			return [];
		}
	}
	
	onMouseEnter(event) {
		if (this.state.selection.select_type == INTERACTION_STATES.FREEZE) { return; }
		
		var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
		this.setState({
			mouse:{
				nx: event.clientX / clientWidth,
				ny: event.clientY / clientHeight
			}});
			this.setSelectType(1);
		}
		onMouseLeave(event) {
			if (this.state.selection.select_type == INTERACTION_STATES.FREEZE) { return; }
			this.setSelectType(0);
		}
		onClick(event) {
			if(this.state.interactionMode=="drag"){
				return
			} else {
				this.setSelectType(
					this.state.selection.select_type == INTERACTION_STATES.FREEZE ?
					INTERACTION_STATES.NONE :
					INTERACTION_STATES.FREEZE);
				}
			}
			mouseDown(event) {
				if(this.state.interactionMode=="drag"){
					this.startDrag(event)
				} 
			}
			mouseUp(event) {
				if(this.state.interactionMode=="drag"){
					this.releaseDrag(event)
				} 
			}
			
			syncViewport() {
				var size = this.getSize();
				if (!size) return;
				this.setState({
					viewport: Object.assign({}, this.state.viewport, {
						clientWidth: size.width,
						clientHeight: size.height
					})
				});
			}
			
			setViewportXY({ x0, y0 }) {
				this.setState({
					viewport: Object.assign({}, this.state.viewport, { x0, y0 })
				});
			}
			setViewportTransform({ x0, y0, zoom }) {
				this.setState({
					viewport: Object.assign({}, this.state.viewport, { x0, y0, zoom })
				});
			}
			
			handleScroll(event) {
				this.zoomIn(-1 * event.deltaY, this.normalizedCoords(event));
				preventDefault(event);
			}
			handleResize(event) {
				this.syncViewport();
			}
			
			centerView() {
				var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
				this.setViewportXY({
					x0: -1 * clientWidth / 2 / zoom,
					y0: -1 * clientHeight / 2 / zoom
				});
			}
			
			handleKeyDown(event) {
				if (event.keyCode === 37) { this.panRight(-30 / this.state.viewport.zoom); }
				if (event.keyCode === 38) { this.panUp(-30 / this.state.viewport.zoom); }
				if (event.keyCode === 39) { this.panRight(30 / this.state.viewport.zoom); }
				if (event.keyCode === 40) { this.panUp(30 / this.state.viewport.zoom); }
			}
			
			exportPng() {
				const backend = this.backend_ref.current;
				const rcanvas = backend.getStorageCanvas();
				
				var export_canvas = ReactDOM.findDOMNode(this.export_canvas_ref.current);
				
				export_canvas.width = 2000;
				export_canvas.height = 2000;
				export_canvas.getContext("2d").drawImage(rcanvas, 0, 0, export_canvas.height, export_canvas.width);
				
				var data = export_canvas.toDataURL("image/jpeg", .75);
				var link = document.createElement("a");
				link.download = "slide.jpg";
				link.href = data;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
			
			choosePreview() {
				
				const backend = this.backend_ref.current;
				const rcanvas = backend.getStorageCanvas();
				var export_canvas = ReactDOM.findDOMNode(this.export_canvas_ref.current);
				
				export_canvas.width = 600;
				export_canvas.height = 600;
				export_canvas.getContext("2d").drawImage(rcanvas, 0, 0, export_canvas.height, export_canvas.width);
				export_canvas.toBlob((blob) => {
					uploadPreview(this.props.metadata_key, this.props.metadata, blob);
				}, 'image/jpeg', 0.95);
			}
			
			drawFromBuffer(child_context, block_render = false) {
				var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
				var backend = this.backend_ref.current;
				var backend2 = this.backend_ref2.current;
				


				var image_canvas = backend.getImage(x0,
					y0,
					x0 + clientWidth / zoom,
					y0 + clientHeight / zoom,
					clientWidth, clientHeight,
					block_render);
					
					let t1 = Date.now()
					
					var image_canvas2 = backend2.getImage(x0,
						y0,
						x0 + clientWidth / zoom,
						y0 + clientHeight / zoom,
						clientWidth, clientHeight,
						block_render);

						if (image_canvas) {
							child_context.setTransform(1, 0, 0, 1, 0, 0);
							child_context.clearRect(-2000, -2000, 4000, 4000);
							const t3 =  Date.now()
							child_context.drawImage(image_canvas, 0, 0);
							const t2 =  Date.now()
							child_context.drawImage(image_canvas2, 0, 0);
						} else {
						}
						
					}
					
					forcedRefresh() {
						if (!this.view_ref.current) { return null; }
						var view = this.view_ref.current.getWrappedInstance();
						var context = view.getContext();
						this.drawFromBuffer(context, true);
					};
					
					onMouseMove(event) {


						if (this.state.selection.select_type == INTERACTION_STATES.FREEZE) { return }
						
						const {nx,ny} = this.normalizedCoords(event);
						this.setState({mouse:{nx,ny}});
						
						if(this.state.interactionMode == "drag"){
							console.log("dragging?")
							if(this.state.dragging){
								console.log("YES!")
								this.dragMouse(event)
								
							} else{ 
								return 
							}
						} else{
							
							var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport
							const self = ReactDOM.findDOMNode(this.self_ref.current);
							
							const {nx,ny} = this.normalizedCoords(event);
							this.setState({mouse:{nx,ny}});
							
							this.setSelectType(INTERACTION_STATES.HOVER);
							// TODO: This is broken. The state will not yet be updated...
							var dataX = nx * (clientWidth / zoom) + x0;
							var dataY = ny * (clientHeight / zoom) + y0;
							
							var n1 = this.props.dataset.nearest(dataX, dataY, .25);
							if (n1) {
								if (this.state.interactionMode == "cell") {
									var idxs = this.props.dataset.idxs_by_segment(n1.seg);
									if (idxs.length > 1) {
										this.setSelectManyIdxs(idxs);
									}
								} else if (this.state.interactionMode == "select") {
									const new_idx = n1.idx;
									if (this.getFirstSelected() != new_idx) {
										this.setSelectUmiIdx(new_idx);
									}
								} else {
									this.setSelectUmiIdx(null);
								}
							} else {
								this.setSelectUmiIdx(null);
							}
						}
					}
					
					getMouseXY() {
						var { nx, ny } = this.state.mouse;
						var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
						return {
							x: nx * clientWidth / zoom + x0,
							y: ny * clientHeight / zoom + y0
						};
					}
					
					realZoom(dz,nxy, viewport){


						var { x0, y0, zoom} = viewport; //this.state.viewport;
						var {clientWidth, clientHeight } = this.state.viewport;

						let { nx, ny } = nxy;
						var z_new = Math.max(10, zoom * (1 + dz / 1000));
						
						var x0_new = nx * clientWidth * (1 / zoom - 1 / z_new) + x0;
						var y0_new = ny * clientHeight * (1 / zoom - 1 / z_new) + y0;
						

						this.setViewportTransform({
							x0: x0_new,
							y0: y0_new,
							zoom: z_new,
						});
						this.setState({temp_viewport:null,
						mouse_zoom_xy:null})

					

					}
					fakeZoom(dz,nxy,viewport){


						var { x0, y0, zoom} = viewport; //this.state.viewport;
						var {clientWidth, clientHeight } = this.state.viewport;
						let { nx, ny } = nxy;
						var z_new = Math.max(10, zoom * (1 + dz / 1000));
						
						var x0_new = nx * clientWidth * (1 / zoom - 1 / z_new) + x0;
						var y0_new = ny * clientHeight * (1 / zoom - 1 / z_new) + y0;
						

						this.setState({temp_viewport:{
							x0: x0_new,
							y0: y0_new,
							zoom: z_new,
						},
						mouse_zoom_xy:nxy
					})

					}
					zoomIn(dz, nxy, doReal) {


						var accurate_viewport = this.state.temp_viewport? this.state.temp_viewport: this.state.viewport;

						
						nxy =  this.state.mouse;

						
						if(doReal){

							this.realZoom(dz,nxy, accurate_viewport)
						} else {

							this.fakeZoom(dz,nxy, accurate_viewport)
							if(this.zoomTimer){window.clearTimeout(this.zoomTimer)}
							this.zoomTimer = window.setTimeout( ()=>{this.zoomIn(dz,nxy,true)}, 300,)
						}

					}

					
					alignPoint(normal_x,normal_y,data_x,data_y){
					
						var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
						var upper_left_datapoint_x = -1 * normal_x * clientWidth / zoom + data_x;
						var upper_left_datapoint_y = -1 * normal_y * clientHeight/ zoom + data_y;
						this.setViewportTransform({
							x0:upper_left_datapoint_x,
							y0:upper_left_datapoint_y,
							zoom:zoom
						})	
					}
					
					dragMouse(ev){
						this.setState({mouse:this.normalizedCoords(ev)})
					}
					normalizedCoords(ev) {
						const self = ReactDOM.findDOMNode(this.self_ref.current);
						var bounds = self.getBoundingClientRect();
						var nx = (ev.clientX - bounds.left) / bounds.width;
						var ny = (ev.clientY - bounds.top) / bounds.height;
						return { nx, ny };
					};
					// on drag start, set dragging=true and save initial data & normal coordinates
					startDrag(ev){						
						const {nx,ny} = this.normalizedCoords(ev)
						var {x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
						var dataX = this.state.mouse.nx * (clientWidth / zoom) + x0;
						var dataY = this.state.mouse.ny * (clientHeight / zoom) + y0;
						
						this.setState({fixed_mouse_position:{
							dataX:dataX,
							dataY:dataY
						},og_mouse_normal_position:{
							nx0:nx,
							ny0:ny,
						},
						mouse:this.normalizedCoords(ev),
						dragging:true
					})

					
				}
				releaseDrag(ev){	
					

					const {dataX,dataY} = this.state.fixed_mouse_position
					const {nx, ny} = this.normalizedCoords(ev)
					
					this.alignPoint(nx,ny,dataX,dataY)					
					this.setState({
						fixed_mouse_position:null,
						og_mouse_normal_position:null,
						dragging:false})
					}
					activateCellMode() {
						this.setState({ interactionMode: "cell" })
					}
					activateSelectMode() {
						this.setState({ interactionMode: "select" })
						
					}
					activateDragMode() {
						this.setState({ interactionMode: "drag" })
						
					}
					
					render() {
						if (this.state.viewport) {
							var transform, trans_origin
							if(this.state.temp_viewport){
								var dz = this.state.temp_viewport.zoom / this.state.viewport.zoom
								transform="scale("+dz+")"// translate("+this.state.mouse.nx*100 dx/dz+"%, "+dy/dz+"px) "
								trans_origin=(this.state.mouse_zoom_xy.nx*100+"% ")+ (this.state.mouse_zoom_xy.ny*100 +"%")
							} else if(this.state.dragging){
								transform= "translate("+(this.state.mouse.nx - this.state.og_mouse_normal_position.nx0)*this.state.viewport.clientWidth +"px ,"+
								(this.state.mouse.ny - this.state.og_mouse_normal_position.ny0)*this.state.viewport.clientHeight+"px )";
							} else{
								transform=null
							}
							return (
								<div className="fov fov-black absolute-fullsize" style={{overflow:"hidden"}} ref={this.self_ref}>

								<ExportCanvas ref={this.export_canvas_ref} />

								<CanvasContainer ref={this.canvas_container_ref} style={{transform :transform,
								  transformOrigin: trans_origin}}>
								<TwoModeCanvas
								ref={this.backend_ref}
								markFresh={this.forcedRefresh.bind(this)}
								dataset={this.props.dataset}
								color_config={{ by_segment: this.state.interactionMode == "cell" }}
								/>
								
								
								<TwoModeSlicedCanvas
								ref={this.backend_ref2}
								markFresh={this.forcedRefresh.bind(this)}
								slicer={this.props.dataset.slice2Slicer.bind(this.props.dataset)}
								getSliceTotalLength={this.props.dataset.getSliceTotalLength.bind(this.props.dataset)}
								sliceReady={this.props.dataset.hasSlice.bind(this.props.dataset)}
								getLastSliceTime={this.props.dataset.getLastSliceTime.bind(this.props.dataset)}
								/>

				
								
								<div
								onMouseMove={this.onMouseMove.bind(this)}
								onMouseEnter={this.onMouseEnter.bind(this)}
								onMouseLeave={this.onMouseLeave.bind(this)}
								onKeyDown={this.bound_keydown}
								onWheel={this.bound_wheel}
								>
								
								<MultiResView
								drawFromBuffer={this.drawFromBuffer.bind(this)}
								bufferReady={true}
								ref={this.view_ref}
								clientWidth={this.state.viewport.clientWidth}
								clientHeight={this.state.viewport.clientHeight}
								x0={this.state.viewport.x0}
								y0={this.state.viewport.y0}
								x1={this.state.viewport.x0 + this.state.viewport.clientWidth / this.state.viewport.zoom}
								y1={this.state.viewport.y0 + this.state.viewport.clientHeight / this.state.viewport.zoom}
								/*here, sliceChangedTime is updated as a prop so that it triggers
								change events whenever there is a change to the datset prop*/
								sliceChangedTime={this.props.selections.last_selection_time}
								/>
								
								{this.state.interactionMode == "select" ?
								(this.getFirstSelected() ?
								<TranscriptSelectionInteractor
								umis={[this.props.dataset.umis[this.getFirstSelected()]]}
								x0={this.state.viewport.x0}
								y0={this.state.viewport.y0}
								x1={this.state.viewport.x0 + this.state.viewport.clientWidth / this.state.viewport.zoom}
								y1={this.state.viewport.y0 + this.state.viewport.clientHeight / this.state.viewport.zoom}
								clickFun={this.bound_click}
								>
								</TranscriptSelectionInteractor>
								: null)
								: null}
								
								{this.state.interactionMode == "drag" ? <DragInteractor 
								clickFun={this.bound_click}
								x0={this.state.viewport.x0}
								y0={this.state.viewport.y0}
								x1={this.state.viewport.x0 + this.state.viewport.clientWidth / this.state.viewport.zoom}
								y1={this.state.viewport.y0 + this.state.viewport.clientHeight / this.state.viewport.zoom}
								mouseDown={this.mouseDown.bind(this)}
								mouseUp={this.mouseUp.bind(this)}
								
								/> : null}
								{this.state.interactionMode == "cell" ?
								<CellSelectionInteractor
								umis={_.map(this.getAllSelected(), (idx) => {
									return this.props.dataset.umis[idx]
								})}
								x0={this.state.viewport.x0}
								y0={this.state.viewport.y0}
								x1={this.state.viewport.x0 + this.state.viewport.clientWidth / this.state.viewport.zoom}
								y1={this.state.viewport.y0 + this.state.viewport.clientHeight / this.state.viewport.zoom}
								clickFun={this.bound_click}
								/>
								
								: null}
								</div>
								</CanvasContainer>

								
								
								{this.props.appearance_props.no_buttons ? "" :
								<OverlayControls
								centerView={this.centerView.bind(this)}
								exportPng={this.exportPng.bind(this)}
								is_demo={this.props.is_demo}
								
								
								interactionMode={this.state.interactionMode}
								activateCellMode={this.activateCellMode.bind(this)}
								activateDragMode={this.activateDragMode.bind(this)}
								activateSelectMode={this.activateSelectMode.bind(this)}
								
								/>
							}
							{this.state.selection.select_type == INTERACTION_STATES.FREEZE && this.getFirstSelected() != null ?
								<ModalSelectionContainer
								dataset={this.props.dataset}
								selected_list={this.getAllSelected()}
								close={() => {
									this.setSelectType(INTERACTION_STATES.NONE);
								}} /> :
								null}
								
								</div>);
							} else {
								return (
									<div className="fov fov-black absolute-fullsize" ref={this.self_ref}></div>
									);
								}
							}
						}
						
						
						
						function mapStateToProps({  selections }) {
							return {  selections };
						}
						
						export default connect(mapStateToProps, { })(DatasetStageContainer);
						
						const CanvasContainer = styled.div`
						width:100%;
						height:100%;
						position:absolute;
						top:0px;
						bottom:0px;
						`;
						
						const ExportCanvas = styled.canvas`
						display:none;
						`;
