import React, { Component } from "react";
import { connect } from "react-redux";
import { signIn } from "../actions";
import PropTypes from "prop-types";
import Welcome from "./Welcome";

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
	    <div className="signin main">
	      <Welcome/>
	    </div>
	);
    }
}

function mapStateToProps({ auth }) {
    return { auth };
}


export default connect(mapStateToProps, { signIn })(Signin);
