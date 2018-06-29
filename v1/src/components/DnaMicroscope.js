import React, { Component } from 'react';
import Viewer from './Viewer';
import MyUserManagement from './MyUserManagement';
import AccountCircle from 'react-icons/lib/md/account-circle';
import ExitToApp from 'react-icons/lib/md/exit-to-app';
import CloudUpload from 'react-icons/lib/md/cloud-upload';
import { signOut, fetchDatasets } from "../actions";
import { connect } from "react-redux";


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
			  })
	    that.setState({directoryListing:result})
	})
    }
  
    render() {
	var main_state;
	var main_app;


	

	if(this.state.managing_user) {
	    main_state="manage";
	} else{
	    main_state="view";
	}

	    
	    main_app =  <Viewer/>

	
	return (

		<div className="App">
		<div className="navbar">
		<div className="nav-right">
		<CloudUpload className="icon" 
	    className="icon manage-account"
	    onClick={function(){
		this.setState({"managing_user":!this.state.managing_user})
	    }.bind(this)
		    }/>
		<ExitToApp className="icon logout" onClick={this.props.signOut}/>
		</div>
		</div>
		<MyUserManagement className="user-manager"
 closed={!this.state.managing_user} onClose={function(){this.setState({managing_user:false})}.bind(this)}/>
		<Viewer/>

	    </div>
       )
   }
}


function mapStateToProps({ auth, datasets }) {
    return { auth, datasets };
}


export default connect(mapStateToProps, { signOut , fetchDatasets})(DnaMicroscope);

