import React, { Component } from "react";
import styled from "styled-components";
import _ from "lodash";

const DropupContainerWrapper = styled.div`
position:relative;
padding-right:20px;

  &:not(:hover) {
    .dropup-content {
      visibility:hidden;
      pointer-events:none;
      opacity:0;
    }
  }
  transition: background-color 150ms ease-out;

  &:hover{
    background-color:white;
    color:black;
   *{
    background-color:inherit; 
   }
  }
  

.dropup-vis-connector{
  position: absolute;
  height: 20px;
  width: 100%;
  left: 0px;
  bottom: 100%;
}

  ul{
padding-left:0px;
  }
  .dropup-content {
    min-width: calc(100% + 4px);

    box-sizing: border-box;
    min-width: calc(100% + 24px);
    border-bottom-right-radius: 0px;
    
    opacity:1;
    background-color:white;  

    transition: opacity 150ms ease-out;

    text-align:left;
    
    border: 2px solid;
    margin: -2px;
    margin-left:-2px;
    border-radius: 5px;
    border-color: white;
    border-bottom-left-radius: 0px;

    left: 0px;
    position: absolute;
    bottom: 100%;
    margin: 0px;
    margin-left:-2px;
    padding: 0px;

    flex-flow:column;
    justify-items:left;
    align-items:left;

    a:link{
        color:inherit;
    }
    li:hover {
      filter: brightness(0.9);
    }
    
    li {
        line-height:1.2em;

      display: block;
      white-space: nowrap;
      list-style: none;
      margin-left:0px;
      padding-left:0px;

      padding:5px;
    }
  }
`;
const WrapDropup = wrapped_component => {
  return (
    <DropupContainerWrapper className="dropup-container">
      {wrapped_component}
    </DropupContainerWrapper>
  );
};

export default WrapDropup;