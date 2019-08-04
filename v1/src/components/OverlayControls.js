
import React, { Component, useState  } from "react";
import { connect } from "react-redux";
import styled, { css } from "styled-components";




import SearchBox from "./SearchBox";
import ExportBox from "./ExportBox";
import InteractionSelectBox from "./InteractionSelectBox";
import ColorModeSelectBox from "./ColorModeSelectBox";

const OverlayControls = props=> {
  // returns left and right controls containing FOV / camera manipulation and
  // dataset manipulation controls respectively

  const [hovered, setHovered] = useState(false);


  const toggleHover = () => setHovered(!hovered);
  return (
      <StyledOverlayControls>
        <ul className="buttons"
                       onMouseEnter={toggleHover}
                       onMouseLeave={toggleHover}
                       >
          <li className={(hovered ? 'parent-hovered' : '') + " btn btn-wide"}
          >
            <InteractionSelectBox
              handleSetInteractor={props.handleSetInteractor}
              style={{ display: "inline" }}
            />
          </li>
          <li className={(hovered ? 'parent-hovered' : '') + " btn btn-wide"}>
            <ColorModeSelectBox
              handleSetColorMode={props.handleSetColorMode}
              style={{ display: "inline" }}
            />
          </li>




          <li className={(hovered ? 'parent-hovered' : '') + " btn btn-wide"}  style={{ marginLeft: "40px",}}>


            <SearchBox
              setActiveSlice={props.setActiveSlice}
              which_dataset={props.which_dataset}
              style={{ display: "inline" }}

            />
          </li>
          <li className={(hovered ? 'parent-hovered' : '') + " btn btn-wide"}>
            <ExportBox
              export_canvas_ref={props.export_canvas_ref}
              backend_canvas_ref={props.backend_canvas_ref}
              which_dataset={props.which_dataset}
              style={{ display: "inline" }}
              getActiveSlice={props.getActiveSlice}
            />
          </li>

        </ul>


      </StyledOverlayControls>
    );
  }



export default OverlayControls

const StyledOverlayControls = styled.div`

  pointer-events:none;
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

  }
  >* {pointer-events:auto}
  > * > {
    pointer-events: auto;
  }
  > * {
    .btn {
      cursor: pointer;
      pointer-events: auto;
    }
  }


  .btn.parent-hovered:not(:hover){
    border-color:transparent;
  }
  
  .btn {
    background-color:black;
    opacity: 1;
    border-width: 2px;
    border-style: solid;
    border-color: white;
    display: inline;
    margin: 5px;
    
    transition: border 200ms ease-out;

    border-radius: 4px;
    &:hover{

      border-top-right-radius:0px;
    }

    line-height: 2em;
    white-space: nowrap;

    &.btn-square {
      width: 2em;
      text-align: center;
    }
    &.btn-wide {
      text-align: center;
    }
  }


  .boxed-icon.active {
    background-color: blue;
  }
`;
