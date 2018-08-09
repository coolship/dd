//external dependencies
import React, {Component} from 'react';
import styled from 'styled-components';
import PropTypes from "prop-types";
import { connect } from "react-redux";

//icons
import AccountCircle from 'react-icons/lib/md/account-circle';
import ExitToApp from 'react-icons/lib/md/exit-to-app';
import CloudUpload from 'react-icons/lib/md/cloud-upload';
import Refresh from 'react-icons/lib/md/refresh';
import Home from 'react-icons/lib/md/home';

//global state
import {MODALS} from "../layout";
import { signOut, signIn, activateModal, resetUIOnly } from "../actions";


class Navbar extends Component {
    static contextTypes = {
	router: PropTypes.object
    };
    render(){
	return (
	    <StyledNavbar>
	      <div className="nav-right">
		<CloudUpload className="icon" onClick={()=>{throw Error("unimplemented");}}/>
		  <ExitToApp className="icon" onClick={this.props.signOut}/>
		  <Refresh className="icon" onClick={this.props.resetUIOnly}/>
		  <Home className="icon" onClick={()=>{this.context.router.history.push("/");}}/>
		    <AccountCircle className="icon" onClick={this.props.signIn}/>
	      </div>
	    </StyledNavbar>
	);
    }
};



function mapStateToProps({ auth }) {
    return { auth };
}


export default connect(mapStateToProps, { resetUIOnly, signOut , activateModal})(Navbar);


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
		margin-top:10px;
		margin-right:10px;
		cursor:pointer;
		color:white;
	    }
	}
`;
