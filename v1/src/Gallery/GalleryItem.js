import React from 'react';
import styled from 'styled-components';

const GalleryItem = (props)=>(
    <StyledGalleryItem onClick={props.clickHandler}>
      <h1>{props.dataset}</h1>
    </StyledGalleryItem>
);

const StyledGalleryItem = styled.div`
background-color:red;
color:white;
border:2px solid;
border-radius:3px;
height:300px;
width:100px;
position:relative;
display:inline-block;

&:hover{
background-color:blue;
cursor:pointer;
}

h1{
color:white;
position:absolute;
left:50%;
top:50%;
transform:translate(-50%, -50%);
}
`;



export default GalleryItem;
