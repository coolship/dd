import React, { Component } from "react";
import { connect } from "react-redux";
import { signIn } from "../actions";
import PropTypes from "prop-types";
import styled, { css } from 'styled-components';
import LoginWithGoogle from "./LoginWithGoogle";
import {NavLink} from "react-router-dom";


class Signin extends Component {
    static contextTypes = {
	router: PropTypes.object
    };

    componentWillUpdate(nextProps) {
	if (nextProps.auth.email) {
	   this.context.router.history.goBack();
	}
    }

    render() {
	return (
	    <CenterContainer><h1>Welcome to DNA microscopy</h1>
	      <div className="biline">This section the DNA Microscopy app is for logged in users. Please sig in with google to create an acocunt! For sample datasets, please see our <NavLink to="/gallery">demo gallery</NavLink><br/><br/></div>
	      <LoginWithGoogle/>
	    </CenterContainer>
	);
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}

export default connect(mapStateToProps, { signIn })(Signin);


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


