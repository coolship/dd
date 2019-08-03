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
  .option.icon{
      color:white;
  }
  .icon-padright{
        padding-right:15px;
  }
  
  .selected .option.icon{
      color:blue;
  }
  .selected{
    color:blue;
  }
  input{
    visibility:hidden;
  }
`;


export default WrapSelectBox