import React, { Component } from 'react';
import styled, {css} from 'styled-components';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import HomeLoginCard from './HomeLoginCard';

import {NavLink} from "react-router-dom";

class Home extends Component {
    static contextTypes = {
	router: PropTypes.object
    };
    render() {
	return (
	    <StyledPage>
	      <StyledBackgroundFooter/>

	      
	      <StyledCenterColumn>
		
		<section id="welcome"><h1>WELCOME</h1><div className="biline">To the <b>DNA-Microscope</b>, a new imaging modality for scalable, optics-free mapping of relative biomolecule positions.Read more on: <a href="https://www.biorxiv.org/content/10.1101/471219v1"> bioArxiv </a></div></section>
		<section className="gallery-section" id="gallery"><StyledGalleryHeader><h1>GALLERY</h1><div className="biline"><NavLink to="/gallery">Explore sample datasets</NavLink></div></StyledGalleryHeader></section>

		<section id="login"><HomeLoginCard/></section>
		<section className="about-section" id="about"><StyledAboutHeader><img src="http://slides.dna-microscopy.org/assets/2x/about.png"/><div className="headergroup"><h1>ABOUT</h1><div className="biline">The world's only all-sequencing<br/>imaging technology</div></div></StyledAboutHeader><div className="content"><p>Our technoogy uses a first of its kind methodology to infer spatial relationships between DNA sequences of transcripts in vitro. We use biophysical modeling and a novel strategy for high dimensional data embedding to create 2 dimensional maps of transcript sequences in biological datasets.</p><p>The output of our algorithm is a 2 dimensional image, with transcript sequences sequences mapped to individual pixels in a DNA microscopy image. Each pixel in the inferred image contains biological sequence data and can be used to infer complex spatial characteristics of gene expression on cellular and sub-cellular levels.</p></div></section>
		<section id="contact" style={{
		    backgroundSize:'cover'
		}}><h1>CONTACT</h1>
		<div className="biline">info@dna-microscopy.org</div>
	    </section>
	    </StyledCenterColumn>

	    </StyledPage>
	);
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps, {})(Home);


const StyledPage=styled.div`
background-color:black;
color:white;
position:relative;


section{
margin-top:100px;
&.gallery-section{
height:400px;
margin-top:50px;
margin-bottom:50px;
width:100%;
max-width:100%;
    background-image: url(http://slides.dna-microscopy.org/assets/2x/gallery.png);
    background-size: 200%;
    background-position: center;
}
&.about-section{
padding-top:200px;
}
};
a {
color:white;
}

h1{
margin-bottom:0px;
margin-top:0px;
}
.biline{
margin:0px;
}
`;


const StyledAboutHeader=styled.div`
overflow:visible;
position:relative;
z-index:1;
img{
bottom:0px;
transform:translate(-50%, 0%);
position:absolute;
z-index:-1;
height:250px;
}
.headergroup{
position:relative;
top:0px;
}
`;

const StyledGalleryHeader=styled.div`
position:relative;
padding-top:200px;
padding-bottom:200px;
overflow:hidden;
width:100%;
img{
opacity:.8;
left:50%;
transform:translate(-50%, -50%);
position:absolute;
z-index:-1;
height:200px;
}
`;

const StyledBackgroundFooter=styled.div`
position:absolute;
bottom:0px;
left:0px;
right:0px;
height:400px;
background-image:url("http://slides.dna-microscopy.org/assets/2x/footer.png");
background-size:contain;
background-repeat:no-repeat;
background-position:50% 100%;
`;


const StyledCenterColumn=styled.div`
position:relative;
padding-bottom:200px;
z-index:1;
>section{
position:static;
margin-left:auto;
margin-right:auto;
max-width:400px;
}

`;

