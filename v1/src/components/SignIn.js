import React, { Component } from "react";
import { connect } from "react-redux";
import { signIn } from "../actions";
import PropTypes from "prop-types";
import styled, { css } from 'styled-components';
import LoginWithGoogle from "./LoginWithGoogle";

class Signin extends Component {
    static contextTypes = {
	router: PropTypes.object
    };

    componentWillUpdate(nextProps) {
	if (nextProps.auth) {
	   this.context.router.history.goBack();
	}
    }

    render() {
	return (
	    <StyledSignIn className="signin main">
	      <div className="welcome">
		<h1>Welcome to DNA microscopy</h1>
		<LoginWithGoogle/>
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

`;
