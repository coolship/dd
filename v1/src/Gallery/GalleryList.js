import styled from 'styled-components';
import React, {Component} from 'react';
import {NavLink} from "react-router-dom";
import _ from "lodash";


const GalleryItem = (props)=>(
    <StyledGalleryItem className={ "gallery-item item-"+props.dataset}>
      <div className={ "preview-background item-"+props.dataset}
	   style={{backgroundImage:"url("+props.meta.preview_url+")",
		   backgroundPosition:props.dataset==786?"right 45vw top 50%":"left 45vw top 50%",
	   }}>
      </div>
      <NavLink to={"/workspace/"+props.dataset}>
      <div className="preview-content">
	<h1>{props.meta.display_name}</h1>
	<div>Explore sample dataset {props.meta.display_name}, generated using DNA microscopy on an in vitro sample.</div>
    </div>
	</NavLink>
    </StyledGalleryItem>

);


const StyledGalleryItem = styled.div`

margin-bottom:0px;

color:white;
height:60vh;
width:100%;
position:relative;
display:block;

.preview-content{
padding:20px;
padding-top:0px;
background-color:rgba(0, 0, 0, .6);
}

&.item-388 .preview-content{
left:-100px;

}
&.item-786 .preview-content{
left:100px;
}



a{
color:white;
text-decoration:none;
}


&:not(:hover){
text-decoration:none;
}

&:hover{

text-decoration:underline;
.preview-background{
opacity:1;
}
}

.preview-background{

opacity:.5;
    z-index: -1;
    left: 0px;
    right:  25vw;
    bottom: 0px;
    position: absolute;
    display: block;
width:120vw;
left:50%;
margin-left:-60vw;


    height: 100%;
    top: 0%;

background-size: 1000px;
background-repeat: no-repeat;
background-blend-mode: lighten;
    mix-blend-mode: lighten;



}

.preview{
    z-index: -1;
    margin: -50px;
    width: 1000px;
    left: -500px;
    top: 0px;
    position: relative;
}
.preview-content{
    //text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
    width: 20vw;
    position: relative;
    top: 10vh;
    margin-left: auto;
    margin-right: auto;
}


`;



export default class GalleryList extends Component{
    render(){
	return(
	    <div className="list-container"
        style= {{minHeight: "100vh",
        position: "relative",
        display: "block",}}
    >
	      <StyledGalleryList>
		<div className="page-header">
            <div class="bg"/>
		  <h1>DNA MICROSCOPY // GALLERY</h1>
		  <div className="biline">Explore demonstration datasets.</div>
		</div>
		<ul>
		  {_.map(this.props.demos,
			 (d,k)=><li  key={d.dataset}><GalleryItem dataset={d.dataset} meta={d}/></li>
			)}
	    </ul>
	    </StyledGalleryList>
			      <StyledBackgroundFooter/>

	    </div>

		
);
    }

};


const StyledBackgroundFooter=styled.div`
left:0px;
right:0px;
height:250px;
background-image:url("http://slides.dna-microscopy.org/assets/2x/footer.png");
background-size:contain;
background-repeat:no-repeat;
background-position:50% 100%;
bottom:0px;
position:absolute;
z-index:-1;
`;


const StyledGalleryList = styled.section`

#contact{
    height: 0px;
    background-size: cover;
    position: relative;
    margin-top: -200px;
}

overflow-x:hidden;
text-align:center;
margin-left:auto;
margin-right:auto;
padding-top:50px;

.page-header{
margin-bottom: 10vh;
height: 33px;
margin-top: -45px;
margin-bottom: 200px;

.bg{
    position:absolute;
    height:90px;
    z-index:-1;
width: 100%;
max-width: 100%;
background-image: url(http://slides.dna-microscopy.org/assets/2x/gallery.png);
background-size: 200%;
background-position: center;
}
h1{
font-size: 250%;
margin-top:0px;
margin-bottom:0px;
padding-top:10px;
}
}

ul{
li{
width:50vw;
list-style:none;
display:inline-block;
}
}

`;


const Footer = (props) =>{
    return(
		<section id="contact" style={{
		    backgroundSize:'cover'
			 }}><h1>CONTACT US</h1>
		<div className="biline">info@dna-microscopy.org</div>
	    </section>
    )
};
