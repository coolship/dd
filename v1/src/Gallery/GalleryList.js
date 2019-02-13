import styled from 'styled-components';
import React, {Component} from 'react';
import {NavLink} from "react-router-dom";
import _ from "lodash";


const GalleryItem = (props)=>(
    <StyledGalleryItem className={ "item-"+props.dataset}>
      <div className={ "preview-background item-"+props.dataset}
	   style={{backgroundImage:"url("+props.meta.preview_url+")",
		   backgroundBlendMode: "lighten",
		   backgroundSize:"100vw",
		   backgroundRepeat:"no-repeat",
		   backgroundPosition:props.dataset==786?"right 30vw top 0px":"left 30vw top 0px",
	   }}>
      </div>
      <div className="preview-content">
	<h1>{props.dataset}</h1>
	<div>view <NavLink to={"/gallery/"+props.dataset}> sample dataset {props.dataset}</NavLink>, generated using DNA microscopy on an in vitro sample.</div>
    </div>
    </StyledGalleryItem>

);


const StyledGalleryItem = styled.div`

&.item-388{
.preview-background{
left:50vw;

}
}

color:white;
height:100vh;
width:100%;
position:relative;
display:block;




a{
color:white;
}

.preview-background{
    z-index: -1;
    left: 0px;
    right:  25vw;
    bottom: 0px;
    position: absolute;
    display: block;
height:100%;
width:120vw;
left:50%;
margin-left:-60vw;
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
    width: 20vw;
    left: 20vw;
    position: relative;
    top: 20vh;
}


`;



export default class GalleryList extends Component{
    render(){
	return(
	    <StyledGalleryList>
	      <h1>DNA MICROSCOPY GALLERY</h1>
	      <div className="biline">Explore demonstration datasets.</div>
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
text-align:center;
margin-left:auto;
margin-right:auto;
padding:100px;

ul{
li{
width:50vw;
list-style:none;
display:inline-block;
}
}
`;

