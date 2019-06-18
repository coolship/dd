import React, { Component } from "react";
import styled, { css } from "styled-components";
import ReactDOM from "react-dom";

// function preventDefault(e) {
//   e = e || window.event;
//   if (e.preventDefault) e.preventDefault();
//   e.returnValue = false;
// }

export default class DragInteractorView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mouse: null,
      dragging: false
    };

    //THIS IS A HACK....
    // setting temp view port like this does
    // not allow for event detection in this widget.
    // it will not trigger draw events.
    this.temp_viewport = null;
  }

  normalizedCoords(ev) {
    //this is necessary only when the container is not the full screen...
    var bounds = this.props.getParentClientRect(); ///this.svg_ref.getBoundingClientRect();
    var nx = (ev.clientX - bounds.left) / bounds.width;
    var ny = (ev.clientY - bounds.top) / bounds.height;
    this.last_ev = ev;

    return { nx, ny };
  }

  //HANDLE DRAG TYPE INTERACTIONS
  mouseDown(ev) {
    const { nx, ny } = this.normalizedCoords(ev);
    var { x0, y0, zoom, clientWidth, clientHeight } = this.props.viewbounds;
    var dataX = this.state.mouse.nx * (clientWidth / zoom) + x0;
    var dataY = this.state.mouse.ny * (clientHeight / zoom) + y0;

    this.setState({
      fixed_mouse_position: {
        dataX: dataX,
        dataY: dataY
      },
      og_mouse_normal_position: {
        nx0: nx,
        ny0: ny
      },
      mouse: this.normalizedCoords(ev),
      dragging: true
    });
  }
  mouseUp(event) {
    if (this.state.dragging) {
      const { dataX, dataY } = this.state.fixed_mouse_position;
      const { nx, ny } = this.normalizedCoords(event);

      this.props.alignPoint(nx, ny, dataX, dataY);
      this.setState({
        fixed_mouse_position: null,
        og_mouse_normal_position: null,
        dragging: false
      });

      var container = ReactDOM.findDOMNode(this.props.transformRef.current);
      var transforms = this.getTransforms(event);
      container.style.transform = null;
      container.style.transformOrigin = null;
  
    }
  }
  mouseMove(event) {
    this.setState({ mouse: this.normalizedCoords(event) });
    if (this.state.dragging) {
      var container = ReactDOM.findDOMNode(this.props.transformRef.current);
      var transforms = this.getTransforms(event);
      container.style.transform = transforms.transform;
      container.style.transformOrigin = transforms.transformOrigin;


      //   var  style =

      //     "transform: " +
      //     this.state.transform +
      //     ";" +
      //     "transformOrigin: " +
      //     this.state.transformOrigin +
      //     ";";


    } else {
      return;
    }
  }

  getTransforms(ev) {
    var transform, transformOrigin;

    //these are both set instantly. no need to read state
    const mouse_zoom_xy = this.normalizedCoords(ev);
    const mouse = this.normalizedCoords(ev);
    //this uses state, but is only updated on mouse down
    const og_mouse_normal_position = this.state.og_mouse_normal_position;

    if (this.temp_viewport) {
      //TODO: may not work

      var dz = this.temp_viewport.zoom / this.props.viewbounds.zoom;
      transform = "scale(" + dz + ")"; // translate("+this.state.mouse.nx*100 dx/dz+"%, "+dy/dz+"px) "
      transformOrigin =
        mouse_zoom_xy.nx * 100 + "% " + (mouse_zoom_xy.ny * 100 + "%");
    } else if (this.state.dragging) {
      transform =
        "translate(" +
        (mouse.nx - og_mouse_normal_position.nx0) *
          this.props.viewbounds.clientWidth +
        "px ," +
        (mouse.ny - og_mouse_normal_position.ny0) *
          this.props.viewbounds.clientHeight +
        "px )";
    } else {
      transform = null;
    }

    return {
      transform: transform,
      transformOrigin: transformOrigin
    };
  }

  //HANDLE SCROLLING AND ZOOMING

  mouseWheel(event) {
    this.zoomIn(-1 * event.deltaY, this.normalizedCoords(event));
    var container = ReactDOM.findDOMNode(this.props.transformRef.current);
    var transforms = this.getTransforms(event);
    container.style.transform = transforms.transform;
    container.style.transformOrigin = transforms.transformOrigin;


    //preventDefault(event);
  }

  realZoom(dz, nxy, active_viewport) {
    var { x0, y0, zoom } = active_viewport; //this.state.viewport;
    var { clientWidth, clientHeight } = this.props.viewbounds;

    let { nx, ny } = nxy;
    var z_new = Math.max(10, zoom * (1 + dz / 1000));

    var x0_new = nx * clientWidth * (1 / zoom - 1 / z_new) + x0;
    var y0_new = ny * clientHeight * (1 / zoom - 1 / z_new) + y0;

    //TODO: this will also not work
    this.props.setParentViewportTransform({
      x0: x0_new,
      y0: y0_new,
      zoom: z_new
    });
    this.setState({ mouse_zoom_xy: null });
    this.temp_viewport = null;

    var container = ReactDOM.findDOMNode(this.props.transformRef.current);
    container.style.transform = null;
    container.style.transformOrigin = null;

  }
  fakeZoom(dz, nxy, active_viewport) {
    var { x0, y0, zoom } = active_viewport;
    var { clientWidth, clientHeight } = this.props.viewbounds;
    let { nx, ny } = nxy;
    var z_new = Math.max(10, zoom * (1 + dz / 1000));

    var x0_new = nx * clientWidth * (1 / zoom - 1 / z_new) + x0;
    var y0_new = ny * clientHeight * (1 / zoom - 1 / z_new) + y0;

    this.temp_viewport = {
      x0: x0_new,
      y0: y0_new,
      zoom: z_new
    };
    this.setState({
      mouse_zoom_xy: nxy
    });
  }
  zoomIn(dz, nxy, doReal) {
    var active_viewport = this.temp_viewport
      ? this.temp_viewport
      : this.props.viewbounds;

    nxy = this.state.mouse;

    if (doReal) {
      this.realZoom(dz, nxy, active_viewport);
    } else {
      this.fakeZoom(dz, nxy, active_viewport);
      if (this.zoomTimer) {
        window.clearTimeout(this.zoomTimer);
      }
      this.zoomTimer = window.setTimeout(() => {
        this.zoomIn(dz, nxy, true);
      }, 300);
    }
  }

  render() {
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
        onMouseDown={this.mouseDown.bind(this)}
        onMouseUp={this.mouseUp.bind(this)}
        onMouseMove={this.mouseMove.bind(this)}
        onWheel={this.mouseWheel.bind(this)}
      />
    );
  }
}

const SvgElement = styled.svg`
cursor:move;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0px;
`;
