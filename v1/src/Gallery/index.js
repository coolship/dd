import React, { Component } from 'react';
import PropTypes from "prop-types";
import GalleryDemo from "./GalleryDemo";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CrumbRoute from "../components/CrumbRoute";
import GalleryList from "./GalleryList";


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



