import React from 'react';
import styled from 'styled-components';
import {NavLink} from "react-router-dom";

const GalleryItem = (props)=>(
  

    <StyledGalleryItem>
      <NavLink to={"/gallery/"+props.dataset}><div className="preview-container">
	<h1>{props.dataset}</h1>

	<img className="preview" src={props.meta.preview_url}></img>
      </div></NavLink>
      	<div>view <NavLink to={"/gallery/"+props.dataset}> sample dataset {props.dataset}</NavLink>, generated using DNA microscopy on an in vitro sample.</div>
    </StyledGalleryItem>

);

const StyledGalleryItem = styled.div`
color:white;
height:auto;
width:250px;
position:relative;
display:inline-block;
margin:20px;

a{
color:white;
}


.preview-container{
height:250px;
width:100%;
position:relative;
display:block;
}

.preview{
width:100%;
position:absolute;
z-index:-1;
left:0px;
top:0px;
height
}

h1{
color:white;
position:absolute;
left:50%;
top:50%;
transform:translate(-50%, -50%);
margin:0px;
}
`;



export default GalleryItem;
