import React, { Component } from "react";
import { connect } from "react-redux";
import styled, { css } from "styled-components";

import OpenWith from "react-icons/lib/md/open-with";
import SelectAll from "react-icons/lib/md/select-all";
import Adjust from "react-icons/lib/md/adjust";
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
        <ul className="buttons">
          <li className="btn btn-wide">
            <InteractionSelectBox
              handleSetInteractor={this.props.handleSetInteractor}
              style={{ display: "inline" }}
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
              export_canvas_ref={this.props.export_canvas_ref}
              backend_canvas_ref={this.props.backend_canvas_ref}
              which_dataset={this.props.which_dataset}
              style={{ display: "inline" }}
              getActiveSlice={this.props.getActiveSlice}
            />
          </li>
          <li className="btn btn-wide">
            <DatasetSelect />
          </li>
        </ul>
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
  padding: 15px;

  ul.buttons {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    margin-top: 0px;
    margin-bottom: 0px;
    padding-left: 0px;
    font-size: .9em;
    font-weight: lighter;
  }

  ul.buttons > li {
    display: inline-block;
    margin-left: 20px;
    margin-right:20px
    padding:5px;
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

  .btn {
    background-color:black;
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
      padding-left: 0.75em;
      padding-right: 0.75em;
      text-align: center;
    }
  }

  .boxed-icon {
    padding: 5px;
    font-size: 1.5em;
  }

  .btn {
    opacity: 0.75;
  }
  .btn:hover {
    background-color: rgba(255, 255, 255, 0.25);
    opacity: 0.9;
  }

  .boxed-icon.active {
    background-color: blue;
  }
`;
