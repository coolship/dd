import React, { Component } from "react";
import { connect } from "react-redux";
import { signIn } from "../actions";
import PropTypes from "prop-types";
import styled, { css } from 'styled-components';


class Signin extends Component {
    static contextTypes = {
	router: PropTypes.object
    };

    componentWillUpdate(nextProps) {
	if (nextProps.auth) {
	    this.context.router.history.push("/app");
	}
    }

    render() {
	return (
	    <StyledSignIn className="signin main">
	      <div className="welcome">
		<h1>Welcome to DNA microscopy</h1>

		<a href="#" className="login" onClick={this.props.signIn}>
		  <div  className="login-container">
		    
		    Log in with Google
		  </div>
		</a>
	      </div>
	    </StyledSignIn>
	);
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}


export default connect(mapStateToProps, { signIn })(Signin);

const StyledSignIn=styled.div`
background-color:red;
.welcome {
  max-width: 20em;
  position: fixed;
  top: 50%;
  margin-top: -150px;
  left: 50%;
    margin-left: -10em;

	.login {
    border: 2px solid;
    padding: 10px;
    border-radius: 5px;
    color: white;
    text-decoration: none;
    display: block;
	    margin-top: 20px; }
    
.login:hover {
      color: black;
    background-color: white; }
}
`;
