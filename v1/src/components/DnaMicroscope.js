import React, { Component } from 'react';
import DatasetSelect from './DatasetSelect';

import { signOut, fetchDatasets, activateModal, resetUIOnly } from "../actions";
import { userIdFromEmail } from "../actions//FileIO";

import { connect } from "react-redux";
import styled, { css } from 'styled-components';

import { NavLink } from "react-router-dom";

import DatasetLoadingContainer from './DatasetLoadingContainer';
import HeadsUp from './HeadsUp';
import _ from "lodash";

import { setCurrentDataset } from "../actions";

class DnaMicroscope extends Component {
	componentWillMount() {
		this.props.fetchDatasets(userIdFromEmail(this.props.auth.email));
	}	
	componentWillUnmount(){

		console.log("UMOUNTING PARENT")
	}
	render() {
		const path = window.location.pathname
		const url_dataset  = path.split("/").length>=2?path.split("/").slice(-1)[0].toString():null;

		console.log(path.split("/")[-1])
		console.log("HELLO")
		console.log(url_dataset, this.props.datasets)
		console.log(Object.values(this.props.datasets).map((d)=>d.dataset))
		console.log(url_dataset in Object.values(this.props.datasets).map((d)=>d.dataset))
		if (url_dataset != this.props.app.current_dataset && this.props.datasets && Object.values(this.props.datasets).find((d)=>d.dataset==url_dataset)){
			//console.log("url dataset")
			this.props.setCurrentDataset(url_dataset)
			//console.log("DnaMic")
			//console.log(this.props.app.current_dataset)

		} 
		

		if (this.props.datasets && Object.keys(this.props.datasets).length > 0 && this.props.app.current_dataset) {

			const inverted = {};
			_.each(
				this.props.datasets,
				(v, k) => { inverted[v["dataset"]] = k }
			);
			const key = inverted[this.props.app.current_dataset];
			const meta = this.props.datasets[key];

			return (
				<div className="App">
					<DatasetLoadingContainer
						which_dataset={this.props.app.current_dataset}
						metadata={meta}
						metadata_key={key} />
				</div>
			);
		} else if (this.props.datasets && Object.keys(this.props.datasets).length > 0) {
			console.log("NO LOADING")

			return (
				<CenterContainer><h1>Welcome to DNA microscopy</h1>
					<div className="biline">In this section of the app, you can access and analyze your datasets. To upload datasets of your own, please visit our <NavLink to="/admin">user administration page</NavLink>. For sample datasets, please see our <NavLink to="/gallery">demo gallery</NavLink><br /><br /></div>
					<DatasetSelect></DatasetSelect>
				</CenterContainer>
			);
		} else {
			console.log("NO LOADING")
			return (
				<CenterContainer><h1>Welcome to DNA microscopy</h1>
					To get started please <NavLink to="/admin">upload some data</NavLink> or view our <NavLink to="/gallery">demo datasets</NavLink>!
							</CenterContainer>
			);
		}
		console.log("NO LOADING")
	}
}



function mapStateToProps({ auth, datasets, dataset, app }) {
	return { auth, datasets, dataset, app };
}


export default connect(mapStateToProps, { resetUIOnly, signOut, fetchDatasets, activateModal, setCurrentDataset })(DnaMicroscope);

const CenterContainer = styled.div`
				top:50vh;
				left:50vw;
				width:300px;
				position:absolute;
				transform: translate(-50%, -50%);
				a{
					color:white;
				}
				`;

