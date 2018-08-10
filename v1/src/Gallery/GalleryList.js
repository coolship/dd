import GalleryItem from "./GalleryItem";
import {connect} from "react-redux";
import styled from 'styled-components';
import React from 'react';
import _ from "lodash";

const GalleryList = (props)=>(
    <StyledGalleryList>
      <h1>explore our datasets</h1>
      <ul>
	{_.map(props.demos,
	       (d,k)=><li  key={d.dataset}><GalleryItem dataset={d.dataset} meta={d}/></li>
	      )}
    </ul>
    </StyledGalleryList>

);


const StyledGalleryList = styled.section`
ul{
li{
list-style:none;
display:inline-block;
}
}
`;

export default connect(({demos})=>{return {demos};})(GalleryList);

