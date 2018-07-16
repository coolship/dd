import React, { Component } from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { fetchUser, fetchDatasets } from "../actions";

//css
import '../css/App.css';
import '../css/Main.css';

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
        <div className="container app-container">
          <Route exact path="/" component={SignIn} />
          <Route path="/app" component={requireAuth(DnaMicroscope)} />
        </div>
      </BrowserRouter>
    );
  }
}


export default connect(null, { fetchUser })(App);



