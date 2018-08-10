//external dependencies
import React, {Component} from 'react';
import styled from 'styled-components';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {NavLink} from "react-router-dom";

//icons
import AccountCircle from 'react-icons/lib/md/account-circle';
import ExitToApp from 'react-icons/lib/md/exit-to-app';
import Settings from 'react-icons/lib/md/settings';
import CloudUpload from 'react-icons/lib/md/cloud-upload';
import Visibility from 'react-icons/lib/md/visibility';
import Home from 'react-icons/lib/md/home';

//global state
import {MODALS} from "../layout";
import { signOut, signIn, activateModal, resetUIOnly } from "../actions";


class Navbar extends Component {
    static contextTypes = {
	router: PropTypes.object
    };
    render(){
	console.log(this.props.auth);
	return (
	    <StyledNavbar>
	      <div className="nav-right">
		<CloudUpload className="icon" onClick={()=>{throw Error("unimplemented");}}/>
		  <Home className="icon" onClick={()=>{this.context.router.history.push("/");}}/>
		    <StyledSignedIn className="user-nav" hasAuth={this.props.auth?true:false}>
		      {this.props.auth?<ExitToApp className="icon" onClick={this.props.signOut}/>:null}
		      {this.props.auth?<NavLink to="/admin"><Settings className="icon"/></NavLink>:null}
		      {this.props.auth?<NavLink to="/app"><Visibility className="icon"/></NavLink>:null}
		      <AccountCircle className="icon signin" onClick={this.props.signIn}/>
		    </StyledSignedIn>
	      </div>
	    </StyledNavbar>
	);
    }
};



function mapStateToProps({ auth }) {
    return { auth };
}
export default connect(mapStateToProps, { resetUIOnly, signOut , activateModal, signIn})(Navbar);


const StyledSignedIn=styled.div`
display:inline-block;
padding:0px;
border:2px solid white;
border-radius:25px;
.signin.signin.signin{
color:${props=>props.hasAuth?'lightgreen':'white'};
}
`



    const StyledNavbar = styled.div`
	position:fixed;
	z-index:100;
	left:0px;
	right:0px;
	top:0px;
	height:auto;

	.nav-right{
	    text-align:right;
	    width:auto;
	    margin-right:20px;
	    .icon{
margin:5px;
		cursor:pointer;
		color:white;
	    }
	}
`;
