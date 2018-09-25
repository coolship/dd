import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import {  listenFetchUser, fetchDemoDatasets, signInAnonyously } from "./actions";
import styled, { css } from 'styled-components';

//components
import DnaMicroscope from "./components/DnaMicroscope";
import Signin from "./components/SignIn";
import Home from "./Home";
import Admin from "./Admin";
import Gallery from "./Gallery";
import Navbar from "./components/Navbar";

//hoc
import requireAuth from "./components/requireAuth";
import CrumbRoute from "./components/CrumbRoute";
import {Breadcrumbs} from "react-breadcrumbs";

class App extends Component {    
    componentWillMount() {
	//this.props.defaultLogin();
	this.props.listenFetchUser();
	this.props.fetchDemoDatasets();

    }
    
    render() {

	return (
	    <BrowserRouter>
	      <StyledAppContainer className="container">
		<StyledBreadcrumbs/>

		<Navbar/>
		<CrumbRoute title="Home" path="/" render={()=>(
		    <Switch>
		      <Route exact path="/" title="Home" component={Home}/>
		      <CrumbRoute path="/signin" title="Sign In" component={Signin} />
		      <CrumbRoute path="/app" title="Microscope" component={requireAuth(DnaMicroscope)} />
		      <CrumbRoute path="/admin" title="Admin" component={requireAuth(Admin)} />
		      <CrumbRoute path="/gallery" title="Gallery" component={Gallery} />
		    </Switch>
		)}/>
	    </StyledAppContainer>
	    </BrowserRouter>
	);
	
    }
}

const StyledBreadcrumbs = styled(Breadcrumbs)`
position:fixed;
z-index:100000;
left:0px;
top:0px;
font-family:sans-serif;
margin:10px;
line-height:1.5em;
a{
color:white;
}

.breadcrumbs__crumb--active{
text-decoration:none;
pointer-events:none;
cursor:caret;
}

`;

const StyledAppContainer=styled.div`
    text-align: center;
    height:100vh;
box-sizing:border-box;
padding-top:20px;
    color:white;
`;
export default connect(({auth})=>{return{auth}}, { listenFetchUser, fetchDemoDatasets })(App);



