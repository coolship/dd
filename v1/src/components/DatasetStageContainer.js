//react architecture
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import styled, { css } from "styled-components";
import withQueryManager from "./QueryManager";


//actions
import { uploadPreview } from "../actions/FileIO";

//rendering tools
import _ from "lodash";

//child components
import TwoModeCanvas from "./TwoModeCanvas";
import TwoModeSlicedCanvas from "./TwoModeSlicedCanvas";
import MultiResView from "./MultiResView";
import OverlayControls from "./OverlayControls";
import RenderContainer from "./RenderContainer";
import PanZoomInteractor from "./DragInteractor";
import RectangleSelectionInteractor from "./RectangleSelectionInteractor";
import CellSelectionInteractor from "./CellSelectionInteractor"

class DatasetStageContainer extends RenderContainer {
  //LIFECYCLE METHODS
  constructor(props) {
    super(props);

    this.COLORMODES={
      CELL:"CELL",
      DEFAULT:"DEFAULT",
    }
    this.INTERACTORS={
      RECTANGLE:{name:"RECTANGLE",
                component:RectangleSelectionInteractor
    },
    PANZOOM:{name:"PANZOOM",
          component:PanZoomInteractor}
          ,
          CELL:{name:"CELL",
                component:CellSelectionInteractor}
                ,
    }
    this.state = {
      interactionMode:this.INTERACTORS.CELL.name,
      colorMode:this.COLORMODES.CELL,
      selection: { selected_idxs: [], select_type: null },
      viewport: null
    };


    this.bound_resize = this.handleResize.bind(this);
    this.export_canvas_ref = React.createRef();
  }



        
        
  componentDidMount() {
    window.addEventListener("resize", this.bound_resize, false);
    if (!this.self_ref.current) {
      return;
    }
    const size = {
      width: ReactDOM.findDOMNode(this.self_ref.current).offsetWidth,
      height: ReactDOM.findDOMNode(this.self_ref.current).offsetHeight
    };

    this.setState({
      viewport: {
        clientWidth: size.width,
        clientHeight: size.height,
        x0: -4.5,
        y0: -1.5,
        zoom:200
      }
    });
  }
  getStageClientRect() {
    return ReactDOM.findDOMNode(this.self_ref.current).getBoundingClientRect();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.bound_resize);
  }

  syncViewport() {
    if (!this.self_ref.current) {
      return;
    }
    const size = {
      width: ReactDOM.findDOMNode(this.self_ref.current).offsetWidth,
      height: ReactDOM.findDOMNode(this.self_ref.current).offsetHeight
    };
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

  handleResize(event) {
    this.syncViewport();
  }

  centerView() {
    var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
    this.setViewportXY({
      x0: (-1 * clientWidth) / 2 / zoom,
      y0: (-1 * clientHeight) / 2 / zoom
    });
  }


  choosePreview() {
    const backend = this.backend_ref.current;
    const rcanvas = backend.getStorageCanvas();
    var export_canvas = ReactDOM.findDOMNode(this.export_canvas_ref.current);

    export_canvas.width = 600;
    export_canvas.height = 600;
    export_canvas
      .getContext("2d")
      .drawImage(rcanvas, 0, 0, export_canvas.height, export_canvas.width);
    export_canvas.toBlob(
      blob => {
        uploadPreview(this.props.metadata_key, this.props.metadata, blob);
      },
      "image/jpeg",
      0.95
    );
  }

  drawFromBuffer(child_context, block_render = false) {
    var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
    var backend = this.backend_ref.current;

    var backend2 = this.backend_ref2.current;

    var image_canvas = backend.getImage(
      x0,
      y0,
      x0 + clientWidth / zoom,
      y0 + clientHeight / zoom,
      clientWidth,
      clientHeight,
      block_render
    );

    let t1 = Date.now();

    var image_canvas2 = backend2.getImage(
      x0,
      y0,
      x0 + clientWidth / zoom,
      y0 + clientHeight / zoom,
      clientWidth,
      clientHeight,
      block_render
    );

    if (image_canvas) {
      child_context.setTransform(1, 0, 0, 1, 0, 0);
      child_context.clearRect(-2000, -2000, 4000, 4000);
      const t3 = Date.now();
      child_context.drawImage(image_canvas, 0, 0);
      const t2 = Date.now();
      child_context.drawImage(image_canvas2, 0, 0);
    } else {
    }
  }

  forcedRefresh() {
    if (!this.view_ref.current) {
      return null;
    }
    var view = this.view_ref.current.getWrappedInstance();
    var context = view.getContext();
    this.drawFromBuffer(context, true);
  }

  setInteractor(nm) {
    if(! this.INTERACTORS[nm]){throw ("no known interaction mode "+nm)}
    this.setState({ interactionMode: this.INTERACTORS[nm].name });
  }

  setColorMode(nm){
    if(! this.COLORMODES[nm]){throw ("no known color mode "+nm)}
    this.setState({colorMode:this.COLORMODES[nm]})
  }

  alignPoint(normal_x, normal_y, data_x, data_y) {
    var { x0, y0, zoom, clientWidth, clientHeight } = this.state.viewport;
    var upper_left_datapoint_x = (-1 * normal_x * clientWidth) / zoom + data_x;
    var upper_left_datapoint_y = (-1 * normal_y * clientHeight) / zoom + data_y;

    this.setViewportTransform({
      x0: upper_left_datapoint_x,
      y0: upper_left_datapoint_y,
      zoom: zoom
    });
  }

  render() {
    if (this.state.viewport) {
      var Interactor = this.INTERACTORS[this.state.interactionMode].component;
      let viewbounds = null;
      if (this.state.viewport) {
        viewbounds = {
          x0: this.state.viewport.x0,
          y0: this.state.viewport.y0,
          x1:
            this.state.viewport.x0 +
            this.state.viewport.clientWidth / this.state.viewport.zoom,
          y1:
            this.state.viewport.y0 +
            this.state.viewport.clientHeight / this.state.viewport.zoom,
          zoom: this.state.viewport.zoom,
          clientHeight: this.state.viewport.clientHeight,
          clientWidth: this.state.viewport.clientWidth
        };
      }

      console.log("SHOULD HAVE THIS")
      console.log(this.props.unsetUmiSlice)
      return (
        <div
          className="fov fov-black absolute-fullsize"
          style={{ overflow: "hidden" }}
          ref={this.self_ref}
        >
          <ExportCanvas ref={this.export_canvas_ref} />

          <CanvasContainer
            ref={this.canvas_container_ref}
          >
            <TwoModeCanvas
              ref={this.backend_ref}
              markFresh={this.forcedRefresh.bind(this)}
              dataset={this.props.dataset}
              color_config={{
                by_segment: this.state.colorMode == this.COLORMODES.CELL
              }}
            />

            <TwoModeSlicedCanvas
              ref={this.backend_ref2}
              markFresh={this.forcedRefresh.bind(this)}
              slicer={this.props.dataset.sliceNSlicer.bind(this.props.dataset)}
              getSliceTotalLength={this.props.dataset.getSliceTotalLength.bind(
                this.props.dataset
              )}
              hasSlice={this.props.dataset.hasSlice.bind(this.props.dataset)}
              getLastSliceTime={this.props.dataset.getLastSliceTime.bind(
                this.props.dataset
              )}
            />

            <MultiResView
              drawFromBuffer={this.drawFromBuffer.bind(this)}
              bufferReady={true}
              ref={this.view_ref}
              clientWidth={this.state.viewport.clientWidth}
              clientHeight={this.state.viewport.clientHeight}
              sliceChangedTime={this.props.selections.last_selection_time}
              x0={this.state.viewport.x0}
              y0={this.state.viewport.y0}
            />

            {viewbounds != null ? (
              <Interactor
                dataset={this.props.dataset}
                ref={input => {
                  this.interactor_ref = input;
                }}
                which_dataset={this.props.which_dataset}
                runQuery={this.props.runQuery}
                viewbounds={viewbounds}
                alignPoint={this.alignPoint.bind(this)}
                setActiveSlice={this.props.setActiveSlice}
                setSliceXYRect={this.props.setSliceXYRect}
                getParentClientRect={this.getStageClientRect.bind(this)}
                setParentViewportTransform={this.setViewportTransform.bind(
                  this
                )}
                transformRef={this.view_ref}
              />
            ) : (
              ""
            )}
          </CanvasContainer>


          {this.props.appearance_props.no_buttons ? (
            ""
          ) : (
            <OverlayControls
              handleSetInteractor={this.setInteractor.bind(this)}
              handleSetColorMode={this.setColorMode.bind(this)}
              runQuery={this.props.runQuery}
              centerView={this.centerView.bind(this)}
              is_demo={this.props.is_demo}
              which_dataset={this.props.metadata.dataset}
              setActiveSlice={this.props.setActiveSlice}
              unsetUmiSlice={this.props.unsetUmiSlice}
              getActiveSlice={this.props.getActiveSlice}
              export_canvas_ref={this.export_canvas_ref}
              backend_canvas_ref={this.backend_ref}
            />
          )}

          {/* {this.state.selection.select_type == INTERACTION_STATES.FREEZE &&
          this.getFirstSelected() != null ? (
            <ModalSelectionContainer
              dataset={this.props.dataset}
              selected_list={this.getAllSelected()}
              close={() => {
                this.setSelectType(INTERACTION_STATES.NONE);
              }}
            />
          ) : null} */}


        </div>
      );
    } else {
      return (
        <div className="fov fov-black absolute-fullsize" ref={this.self_ref} />
      );
    }
  }
}

function mapStateToProps({ selections }) {
  return { selections };
}

export default withQueryManager(connect(
  mapStateToProps,
  {}
)(DatasetStageContainer));

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0px;
  bottom: 0px;
`;

const ExportCanvas = styled.canvas`
  display: none;
`;
