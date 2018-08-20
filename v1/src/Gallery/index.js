import React, { Component } from 'react';
import PropTypes from "prop-types";
import GalleryDemo from "./GalleryDemo";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CrumbRoute from "../components/CrumbRoute";
import GalleryList from "./GalleryList";
import {connect} from "react-redux";
import {fetchDemoDatasets} from '../actions';


class Gallery extends Component {
    constructor(props){
	super(props);
	this.props.fetchDemoDatasets();
    }    
    render(){	
	if(Object.keys(this.props.demos).length > 0){
	    return (
		<Switch>
		  <Route title="List" exact path='/gallery'
			 render={(props) =><GalleryList {...props} demos={this.props.demos} />}
		    />
		    <Route path='/gallery/:number'
			   render={(props) => <GalleryDemo {...props} demos={this.props.demos} />}
		      />
		</Switch>
	    );
	} else return null;
    }

    
};




const mapStateToProps=({demos})=>{return {demos};};
export default connect(mapStateToProps,{fetchDemoDatasets})(Gallery);
