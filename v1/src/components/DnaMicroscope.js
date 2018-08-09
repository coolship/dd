import React, { Component } from 'react';
import DatasetSelect from './DatasetSelect';

import { signOut, fetchDatasets, activateModal, resetUIOnly } from "../actions";
import { connect } from "react-redux";
import styled, { css } from 'styled-components';


import DatasetContainer from './DatasetContainer';
import HeadsUp from './HeadsUp';


class DnaMicroscope extends Component {
    componentWillMount(){
	this.props.fetchDatasets(this.props.auth.email);
    }
    
    activateUser(){
	var list_directory_url = "https://www.googleapis.com/storage/v1/b/slides.dna-microscopy.org/o";
	const token = this.state.access_token;
	var that = this;

	fetch(list_directory_url,{
	    method:'GET',
	    headers:{
		"Content-Type": "application/json",
		'Authorization': 'Bearer ' + token,
	    }
	}).then(function(response){
	    return response.json()
	}).then(function(success){

	    var result = success
	    that.setState({datasets:result.items.map(function(e,i){return e.name})
			   .filter(function(e){return e.search("dataset")>=0
					       && e.split("/").slice(-1) !== "" })
			  });
	    that.setState({directoryListing:result});
	});
    }
  
    render() {


	return (

	    <div className="App">
	      {this.props.app.current_dataset!=null?<DatasetContainer which_dataset={this.props.app.current_dataset}/>:<CenterContainer><h1>Welcome to DNA microscopy</h1>
<DatasetSelect></DatasetSelect></CenterContainer>}

	      
	    </div>
	);
    }
}


function mapStateToProps({ auth, datasets, dataset, app }) {
    return { auth, datasets, dataset, app };
}


export default connect(mapStateToProps, { resetUIOnly, signOut , fetchDatasets, activateModal})(DnaMicroscope);


const CenterContainer = styled.div`
top:50%;
left:50%;
position:absolute;
transform: translate(-50%, -50%);
    height:100vh;

`;

