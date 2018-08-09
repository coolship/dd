import React from 'react';
import styled from 'styled-components';


const GalleryDemo = (props)=>(
    <StyledGalleryDemo>
      <h1>{props.match.params.number}</h1>
    </StyledGalleryDemo>
);

const StyledGalleryDemo=styled.div`
width:100vw;
height:100vh;
top:0vh;
left:0vw;
position:fixed;
background-color:rgba(255, 0, 0, .25);

h1{
position:absolute;
left:50%;
top:50%;
transform:translate(-50%, -50%);
}
`;

export default GalleryDemo;
