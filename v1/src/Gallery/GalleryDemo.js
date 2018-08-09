import React from 'react';
import styled from 'styled-components';
import {Breadcrumb} from 'react-breadcrumbs';
import DatasetContainer from "../components/DatasetContainer";

const GalleryDemo = (props)=>(
    <Breadcrumb data={{
    		    title: <b>Sample Dataset {props.match.params.number}</b>,
    		    pathname: props.match.url,
    		    search: null
		}}>
      <StyledGalleryDemo>
	<DatasetContainer which_dataset={props.match.params.number}/>
      </StyledGalleryDemo>
    </Breadcrumb>

);

const StyledGalleryDemo=styled.div`
width:100vw;
height:100vh;
top:0vh;
left:0vw;
position:fixed;

`;

export default GalleryDemo;
