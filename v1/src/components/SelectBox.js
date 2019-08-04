import React, { Component } from "react";
import styled from "styled-components";
import _ from "lodash";


const WrapSelectBox = wrapped_component => {
  return (
    <SelectBoxWrapper>
      {wrapped_component}
    </SelectBoxWrapper>
  );
};



const SelectBoxWrapper = styled.div`
  position: relative;
  a:link {
    color: white;
  }

  .icon-padright{
        padding-right:15px;
  }
  
  .selected .option.icon{
      color:blue;
  }
  label .icon{
    font-size:1em;
  }
  .selected{
    color:blue;
  }
  input{
    margin:0px;
    width: 0px;
    visibility: hidden;
    height: 0px;
  }
`;


export default WrapSelectBox