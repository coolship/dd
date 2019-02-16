import React, { Component } from 'react';
import DatasetSelect from './DatasetSelect';

import { signOut, fetchDatasets, activateModal, resetUIOnly } from "../actions";
import { connect } from "react-redux";
import styled, { css } from 'styled-components';

import { NavLink } from "react-router-dom";

import DatasetLoadingContainer from './DatasetLoadingContainer';
import HeadsUp from './HeadsUp';
import _ from "lodash";


class DnaMicroscope extends Component {
	componentWillMount() {
		this.props.fetchDatasets(this.props.auth.email);
	}

	render() {
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
			return (
				<CenterContainer><h1>Welcome to DNA microscopy</h1>
					<div className="biline">In this section of the app, you can access and analyze your datasets. To upload datasets of your own, please visit our <NavLink to="/admin">user administration page</NavLink>. For sample datasets, please see our <NavLink to="/gallery">demo gallery</NavLink><br /><br /></div>
					<DatasetSelect></DatasetSelect>
				</CenterContainer>
			);
		} else {
			return (
				<CenterContainer><h1>Welcome to DNA microscopy</h1>
					To get started please <NavLink to="/admin">upload some data</NavLink> or view our <NavLink to="/gallery">demo datasets</NavLink>!
							</CenterContainer>
			);
		}
	}
}



function mapStateToProps({ auth, datasets, dataset, app }) {
	return { auth, datasets, dataset, app };
}


export default connect(mapStateToProps, { resetUIOnly, signOut, fetchDatasets, activateModal })(DnaMicroscope);

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

