import React, { Component } from 'react';
import PropTypes from "prop-types";
import GalleryItem from "./GalleryItem";
import GalleryDemo from "./GalleryDemo";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CrumbRoute from "../components/CrumbRoute";

class GalleryList extends Component {
    static contextTypes = {
	router: PropTypes.object
    };
    render(){
	return (
	    <section><h1>explore our datasets</h1>
	      
	      <GalleryItem dataset="190" clickHandler={()=>{this.context.router.history.push("/gallery/190");}}/>
		<GalleryItem dataset="34" clickHandler={()=>{this.context.router.history.push("/gallery/34");}}/>
	    </section>
	);
    }
    
}


export default class Gallery extends Component {
    static contextTypes = {
	router: PropTypes.object
    };
    
    render(){
	return (
	      <Switch>
		<Route title="List" exact path='/gallery' component={GalleryList}/>
		<Route path='/gallery/:number' component={GalleryDemo}/>
	      </Switch>
	);
    }

    
};



