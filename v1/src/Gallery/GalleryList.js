import GalleryItem from "./GalleryItem";
import styled from 'styled-components';
import React, {Component} from 'react';
import _ from "lodash";

export default class GalleryList extends Component{
    render(){
	return(
	    <StyledGalleryList>
	      <h1>DNA MICROSCOPY GALLERY</h1>
	      <div className="biline">View original datasets generated in [REFERENCE]. To create an account and upload your own datasets, sign in and visit the account management page linked at our home page.</div>
	      <ul>
		{_.map(this.props.demos,
		       (d,k)=><li  key={d.dataset}><GalleryItem dataset={d.dataset} meta={d}/></li>
		      )}
	    </ul>
		</StyledGalleryList>
);
    }

};


const StyledGalleryList = styled.section`
text-align:left;
margin-left:auto;
margin-right:auto;
padding:100px;

ul{
li{
list-style:none;
display:inline-block;
}
}
`;


