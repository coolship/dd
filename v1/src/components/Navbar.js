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



const SlideOutWrapper =styled.div`
&:not(:hover){
	.slides{
		display:none;
	}
}	
&:hover{
	.slidesaway{
		display:none;
	}
}
`

const WrapSlideOut = wrapped_component => {
	return (
	  <SlideOutWrapper>
		{wrapped_component}
	  </SlideOutWrapper>
	);
  };

const InlineList = styled.ul`
margin:0px;  
.valign{
	>*{vertical-align:middle;}
}
li{
	  display:inline;
	  a{
		color:white;
	  }
	  a:link{
		color:white;
	  }

	//   a:visited{
	// 	color:red;
	//   }

	  >*{
		vertical-align:middle;
		margin:0px;  
    margin: 0px;
    padding: 0px;
	display: inline;
	
	  }
	  .icon{
		  font-size:150%;
	  }
  }
  li:not(:first-child){padding-left:10px}
  li:not(:last-child){padding-right:10px}
  list-style:none;
`


class Navbar extends Component {
    static contextTypes = {
	router: PropTypes.object
    };
    render(){
	return (
	    <StyledNavbar>
	       <div className="nav-right">
		    <StyledSignedIn className={"user-nav "+ (this.props.auth.email?"signed_in":"signed_out")}  hasAuth={this.props.auth.email?true:false}>
		      {this.props.auth.email?
			
			  WrapSlideOut( 
				<div className="AccountHoverContainer">
									<span className="slides">

<InlineList style={{display:"inline-block"}}>
	<li><span>Hi {this.props.auth.email}!</span></li> 
	<li><NavLink className="valign" to="/"><span>GO HOME</span> <Home className="icon" onClick={()=>{this.context.router.history.push("/");}}/></NavLink></li>
	<li><NavLink className="valign" to="/" onClick={this.props.signOut}><span>LOG OUT</span> <ExitToApp className="icon"/></NavLink></li>
	<li><NavLink className="valign" to="/upload2"><span>MANAGE DATA</span> <Visibility className="icon"/></NavLink></li>
</InlineList>

</span>
			<AccountCircle className="icon signin slidesaway"/>

				   </div>
				)			  :
<InlineList style={{display:"inline-block"}}>
	<li><span style={{paddingRight:"10px", textDecoration:"underline"}}  onClick={this.props.signIn}>SIGN IN</span> <AccountCircle className="icon" onClick={this.props.signIn} /></li>
</InlineList>

			  	//<AccountCircle className="icon" onClick={this.props.signIn} />
			  }
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

.signed_out{
	background-color:white;
	color:black;
}

.signin.signin.signin{
color:${props=>props.hasAuth?'lightgreen':'white'};
}
`



    const StyledNavbar = styled.div`
	position:fixed;
	z-index:100;
	right:0px;
	top:0px;
	height:auto;

	.nav-right{
	    text-align:right;
	    width:auto;
	    padding:20px;
	    .icon{
		cursor:pointer;
		
	    }
	}
`;
