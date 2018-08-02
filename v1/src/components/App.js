import React, { Component } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser, fetchDatasets } from "../actions";
import styled, { css } from 'styled-components';

//components
import DnaMicroscope from "./DnaMicroscope";
import Signin from "./SignIn";
import Home from "../Home";
import requireAuth from "./requireAuth";


class App extends Component {    
  componentWillMount() {
      this.props.fetchUser();
  }
  
  render() {
    return (
      <BrowserRouter>
          <Route exact path="/" component={Signin} />
          <Route path="/app" component={requireAuth(DnaMicroscope)} />
      </BrowserRouter>
    );
  }
}

export default connect(null, { fetchUser })(App);



