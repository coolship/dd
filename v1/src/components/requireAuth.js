
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

/*
[TODO]
right now, this signin widget is not functional with a multi-page app
unless the user ahs an acitve state stored inlocalstorage, all redirects
will push the user back to the microscope app which is not the intended 
use case

either the user authentication must be read from the authentication cookie 
before this app is rendered or else we must remember the router path and
redirect to that page after signin is successful

this will require that signin and requireAuth somehow communcate on the level
of the router. Not sure exactly how to accomplish this...
*/

export default function(ComposedComponent) {
  class Authentication extends Component {
    static contextTypes = {
      router: PropTypes.object
    };

      componentWillMount() {

	  if (! this.props.authenticated) {
              this.context.router.history.push("/");
      }
	  
    }

    componentWillUpdate(nextProps) {
      if (!nextProps.authenticated) {
        this.context.router.history.push("/");
      }
    }

    render() {
      if (this.props.authenticated) {
        return <ComposedComponent {...this.props} />;
      }
      return null;
    }
  }

  function mapStateToProps(state) {
    return { authenticated: state.auth };
  }

  return connect(mapStateToProps)(Authentication);
}
