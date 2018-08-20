import React from 'react';
import styled from 'styled-components';
import {Breadcrumb} from 'react-breadcrumbs';
import DatasetLoadingContainer from "../components/DatasetLoadingContainer";
import _ from 'lodash';

const GalleryDemo = (props)=>{
    return(
	<Breadcrumb data={{
    			title: <b>Sample Dataset {props.match.params.number}</b>,
    	    pathname: props.match.url,
    	    search: null
	}}>
	    <StyledGalleryDemo>
	    <DatasetLoadingContainer
	which_dataset={props.match.params.number}
	metadata={ _.find(props.demos,(d)=>d.dataset==props.match.params.number)}
	is_demo={true}/>
	</StyledGalleryDemo>
	</Breadcrumb>
    );

};

const StyledGalleryDemo=styled.div`
width:100vw;
height:100vh;
top:0vh;
left:0vw;
position:fixed;

`;

export default GalleryDemo;
