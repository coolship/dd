import React, { Component } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser, fetchDatasets } from "./actions";
import styled, { css } from 'styled-components';

//components
import DnaMicroscope from "./components/DnaMicroscope";
import Signin from "./components/SignIn";
import Home from "./Home";
import Admin from "./Admin";
import requireAuth from "./components/requireAuth";


class App extends Component {    
  componentWillMount() {
      this.props.fetchUser();
  }
  
  render() {
    return (
      <BrowserRouter>
        <StyledAppContainer className="container">
          <Route exact path="/" component={Signin} />
          <Route path="/app" component={requireAuth(DnaMicroscope)} />
	  <Route path="/home" component={Home} />
	  <Route path="/admin" component={requireAuth(Admin)} />

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



