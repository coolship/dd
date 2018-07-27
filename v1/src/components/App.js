import React, { Component } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser, fetchDatasets } from "../actions";
import styled, { css } from 'styled-components';

//components
import DnaMicroscope from "./DnaMicroscope";
import SignIn from "./SignIn";
import requireAuth from "./requireAuth";


class App extends Component {    
  componentWillMount() {
      this.props.fetchUser();
  }
  
  render() {
    return (
      <BrowserRouter>
        <StyledAppContainer className="container">
          <Route exact path="/" component={SignIn} />
          <Route path="/app" component={requireAuth(DnaMicroscope)} />
        </StyledAppContainer>
      </BrowserRouter>
    );
  }
}

const StyledAppContainer=styled.div`
    text-align: center;
    height:100vh;
    color:white;
`;
export default connect(null, { fetchUser })(App);



