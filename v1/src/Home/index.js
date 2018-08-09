import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from "prop-types";
import { connect } from "react-redux";

class Home extends Component {
    static contextTypes = {
	router: PropTypes.object
    };
    render() {
	return (
	    <StyledHome>
  <div>
    <section id="welcome"><h1>WELCOME</h1><div className="biline">To <b>DNA-Microscopy.org</b>,
	    the web platform for the sequencing-based imaging tool developed  in [REFERENCE].<p></p></div></section>
    <section id="gallery"><h1>GALLERY</h1><div className="biline"><a onClick={()=>{this.context.router.history.push("/gallery");}}>Explore sample datasets</a></div></section>
    <section id="about"><h1>ABOUT</h1><div className="biline">The world's only all-sequencing imaging technology</div><div className="content"><p>Our technoogy uses a first of its kind methodology to infer spatial relationships between DNA sequences of transcripts in vitro. We use biophysical modeling and a novel strategy for high dimensional data embedding to create 2 dimensional maps of transcript sequences in biological datasets.</p><p>The output of our algorithm is a 2 dimensional image, with transcript sequences sequences mapped to individual pixels in a DNA microscopy image. Each pixel in the inferred image contains biological sequence data and can be used to infer complex spatial characteristics of gene expression on cellular and sub-cellular levels.</p></div></section>
		<section id="contact"><h1>CONTACT</h1>
		<div className="biline">info@dna-microscopy.org</div>
		</section>
  </div>
	    </StyledHome>
	);
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps, {})(Home);



const StyledHome=styled.div`
background-color:black;
color:white;
max-width:600px;
margin-left:auto;
margin-right:auto;
section{
margin-top:200px;
h1{
}
};
`
