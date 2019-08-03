import React, { Component } from "react";
import styled from "styled-components";
import _ from "lodash";

const DropupContainerWrapper = styled.span`
position:relative;
  &:not(:hover) {
    .dropup-content {
      display: none;
    }
  }


  ul{
padding-left:0px;
  }
  .dropup-content {
    position: absolute;
    bottom: 100%;
    padding:20px;

    flex-flow:column;
    justify-items:center;
    align-items:center;

    left: 50%;
    transform: translate(-50%);
    background-color:black;

    a:link{
        color:white;
    }
    li:hover {
      border: 2px solid green;
    }
    
    li:not(:hover){
        border: 2px solid transparent;
    }
    li {
        line-height:1.2em;

      display: block;
      white-space: nowrap;
      list-style: none;
      margin-left:0px;
      padding-left:0px;
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