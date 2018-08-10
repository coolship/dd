import React from 'react';
import styled from 'styled-components';
import {NavLink} from "react-router-dom";

const GalleryItem = (props)=>(

    <StyledGalleryItem>
      <div className="preview-container">
	<h1>{props.dataset}</h1>
	<NavLink to={"/gallery/"+props.dataset}>

	  <img className="preview" src={props.meta.preview_url}></img>
	</NavLink>
      </div>
    </StyledGalleryItem>
);

const StyledGalleryItem = styled.div`
color:white;
border:2px solid;
border-radius:3px;
height:150px;
width:150px;
position:relative;
display:inline-block;
margin:20px;

&:hover{
cursor:pointer;
}

.preview-container{

}

.preview{
width:100%;
position:absolute;
z-index:-1;
left:0px;
top:0px;
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
