import React, { Component } from 'react';
import UserManagerContainer from './UserManagerContainer';
import AccountCircle from 'react-icons/lib/md/account-circle';
import ExitToApp from 'react-icons/lib/md/exit-to-app';
import CloudUpload from 'react-icons/lib/md/cloud-upload';
import { signOut, fetchDatasets, activateModal } from "../actions";
import {MODALS} from "../layout"
import { connect } from "react-redux";

import DatasetContainer from './DatasetContainer';
import HeadsUpComponent from './HeadsUpComponent';
import logo from '../logo.svg';



class DnaMicroscope extends Component {
    constructor(props){
	super(props)
	this.state={
	    managing_user:false
	}
    }

    componentWillMount(){
	this.props.fetchDatasets(this.props.auth.email);

    }
    
    activateUser(){
	var list_directory_url = "https://www.googleapis.com/storage/v1/b/slides.dna-microscopy.org/o"
	const token = this.state.access_token
	var that = this

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



	console.log(this.props.app.current_dataset);
	return (

		<div className="App">
		<div className="navbar">
		<div className="nav-right">
		<CloudUpload
	    className="icon manage-account"
	    onClick={event=>this.props.activateModal(MODALS.USER_MANAGER)}/>
		<ExitToApp className="icon logout" onClick={this.props.signOut}/>
		</div>
		</div>

		<UserManagerContainer/>
		{this.props.app.current_dataset!=null?<DatasetContainer which_dataset={this.props.app.current_dataset}/>:null}
		<HeadsUpComponent/>

		
	    </div>
       )
   }
}


function mapStateToProps({ auth, datasets, dataset, app }) {
    return { auth, datasets, dataset, app };
}


export default connect(mapStateToProps, { signOut , fetchDatasets, activateModal})(DnaMicroscope);

