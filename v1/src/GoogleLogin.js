import React, { Component } from 'react';
import Modal from 'react-modal';
import ReactDOM from 'react-dom';
import {GoogleAPI,GoogleLogin,GoogleLogout} from 'react-google-oauth'


const customStyles = {
    content : {
	top                   : '50%',
	left                  : '50%',
	right                 : 'auto',
	bottom                : 'auto',
	marginRight           : '-50%',
	transform             : 'translate(-50%, -50%)'
    }
};




class MyGoogleLogin extends Component {
    constructor(props){
	super(props);

	this.setAccessToken = this.props.setAccessToken;
	this.state = {
	};
    }

    onSuccess(response){
	var token = response.Zi.access_token;
	console.log(token)
	this.setAccessToken(token)
    }

    render(){
	return (

		<Modal
            isOpen={!this.props.hasAccessToken}
            style={customStyles}
            contentLabel="Google Login"
	    	>
		<GoogleAPI
	    clientId="211180157594-m5cchnk0hnh6iu0j7hkiekfehbsd146s.apps.googleusercontent.com"
	    scope={"https://www.googleapis.com/auth/devstorage.full_control"}
	    //onUpdateSigninStatus={onSuccess.bind(this)}
	    onInitFailure={function(){console.log("failure");}} >
		<div>
		<div><GoogleLogin
	    onLoginSuccess={this.onSuccess.bind(this)}/></div>
		</div>
		</GoogleAPI>
		</Modal>)
    }


}

export default MyGoogleLogin
