import React, { Component } from 'react';
import { connect } from "react-redux";
import { signIn } from "../actions";





class Welcome extends Component {

    renderSelectOrSignIn(){

	if(this.props.auth){
	    console.log("has auth, rendering datasets")
	    return null
	} else {
	    console.log("no auth, rendering signin")
	    return (

		  <a href="#" className="login" onClick={this.props.signIn}>
		    <div  className="login-container">
		  
		    Log in with Google
		</div>
		    </a>
	    );
	}
    }

    
    render(){
	return(
	    
		<div className="welcome">
		<h1>Welcome to DNA microscopy</h1>
		{ this.renderSelectOrSignIn() }
		</div>

	);
    }

}


function mapStateToProps( {auth}){
    return {auth};
}


export default connect( mapStateToProps, { signIn } )(Welcome);
