import GalleryItem from "./GalleryItem";
import {NavLink} from "react-router-dom";
import {connect} from "react-redux";
import React from 'react';
import _ from "lodash";

const GalleryList = (props)=>(
    <section><h1>explore our datasets</h1>
      {_.map(props.demos,
	     (d,k)=>{return <span key={d.dataset}>
		     <NavLink to={"/gallery/"+d.dataset}><GalleryItem dataset={d.dataset}/></NavLink>
		     </span>;}
      )}
      

    </section>
);


export default connect(({demos})=>{return {demos};})(GalleryList);

