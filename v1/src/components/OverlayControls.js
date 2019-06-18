import React, { Component } from "react";
import { connect } from "react-redux";
import styled, { css } from "styled-components";
import CloudDownload from "react-icons/lib/md/cloud-download";

import OpenWith from "react-icons/lib/md/open-with";
import SelectAll from "react-icons/lib/md/select-all";
import Adjust from "react-icons/lib/md/adjust";
import PanZoomControls from "./PanZoomControls";
import DatasetSelect from "./DatasetSelect";

import SearchBox from "./SearchBox";
import ExportBox from "./ExportBox";
import InteractionSelectBox from "./InteractionSelectBox";

export default class OverlayControls extends Component {
  // returns left and right controls containing FOV / camera manipulation and
  // dataset manipulation controls respectively
  render() {
    return (
      <StyledOverlayControls>
        <div className="left-controls">
          <ul className="buttons">


          <li className="btn btn-wide">
              <InteractionSelectBox 
              handleSetInteractor={this.props.handleSetInteractor}
              style={{ display: "inline" }} />
            </li>
            <li className="btn btn-square">
              <CloudDownload
                className="boxed-icon"
                onClick={this.props.exportPng}
              />
            </li>
            <li className="btn  btn-wide">
              <SearchBox
                setActiveSlice={this.props.setActiveSlice}
                which_dataset={this.props.which_dataset}
                style={{ display: "inline" }}
              />
            </li>
            <li className="btn btn-wide">
              <ExportBox 
              which_dataset={this.props.which_dataset}
              style={{ display: "inline" }}
              getActiveSlice = {this.props.getActiveSlice}
              />
            </li>
          </ul>
          {/* 
                <PanZoomControls
                    zoomIn={this.props.zoomIn}
                    panRight={this.props.panRight}
                    panUp={this.props.panUp}
                    centerView={this.props.centerView}/> */}
        </div>
        {this.props.is_demo ? null : (
          <div className="right-controls">
            <DatasetSelect />
          </div>
        )}
      </StyledOverlayControls>
    );
  }
}

const StyledOverlayControls = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  text-align: left;

  ul.buttons {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: left;
    margin-top:0px;
    margin-bottom:0px;
  }

  ul.buttons > li {
    display: inline-block;
  }
  > * > {
    pointer-events: auto;
  }
  > * {
    .btn {
      cursor: pointer;
      pointer-events: auto;
    }
  }
  .right-controls {
    position: absolute;
    right: 0px;
    bottom: 0px;
  }

  .btn {
    opacity: 1;
    border-width: 2px;
    border-style: solid;
    border-color: white;
    display: inline;
    margin: 5px;
    border-radius: 4px;
    line-height: 2em;
    white-space: nowrap;

    &.btn-square {
      width: 2em;
      text-align: center;
    }
    &.btn-wide {
        padding-left:.75em;
        padding-right:.75em;
        text-align: center;
      }
  }

  .boxed-icon {
    padding: 5px;
    font-size: 1.5em;
  }

  .btn:hover {
    background-color: rgba(255, 255, 255, 0.25);
    opacity: 0.8;
  }

  .boxed-icon.active {
    background-color: blue;
  }
`;
