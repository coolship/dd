import React, { Component } from 'react';
import PropTypes from "prop-types";
import GalleryDemo from "./GalleryDemo";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CrumbRoute from "../components/CrumbRoute";
import GalleryList from "./GalleryList";
import { connect } from "react-redux";
import { fetchDemoDatasets } from '../actions';
import styled, { css } from 'styled-components';



class Gallery extends Component {
	constructor(props) {
		super(props);
		this.props.fetchDemoDatasets();
	}
	render() {
		if (Object.keys(this.props.demos).length > 0) {
			return (
				<Switch>
					<Route title="List" exact path='/gallery'
						render={(props) => <GalleryList {...props} demos={this.props.demos} />}
					/>
					<Route path='/gallery/:number'
						render={(props) => <GalleryDemo {...props} demos={this.props.demos} />}
					/>
				</Switch>
			);
		} else return null;
	}
};

const mapStateToProps = ({ demos }) => { return { demos }; };
export default connect(mapStateToProps, { fetchDemoDatasets })(Gallery);

const StyledPage = styled.div`
background-color:black;
color:white;
position:relative;

section{
	margin-top:100px;
	&.explore{
		height:400px;
		margin-top:50px;
		margin-bottom:50px;
		width:100%;
		max-width:100%;
		position:relative;
		background-image: url(http://slides.dna-microscopy.org/assets/2x/gallery.png);
		background-size: 200%;
		background-position: center;
		.explore-header-link{
			text-decoration:underline;
			font-size:120%;
			font-style:italic;
		}
		`
