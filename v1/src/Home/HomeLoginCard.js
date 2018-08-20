import React, {Component} from 'react';
import styled from 'styled-components';
import LoginWithGoogle from "../components/LoginWithGoogle";
import { signIn , signOut} from "../actions";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";


const HomeLoginCard = (props)=>{
    let SignInComponent;
    if(props.auth&&props.auth.has_admin){
	SignInComponent =
	    <div>Logged in as <b>ADMIN</b> user, {props.auth.email}.
	    <ul>
	    <NavLink to="/admin"><li>Manage your datasets and administer demos</li></NavLink>
	    <NavLink to="/app"><li>View your datasets in the DNA microscope</li></NavLink>
	    <a href="#" onClick={props.signOut}><li>Sign out</li></a>
	</ul>
	</div>;
    } else if (props.auth) {
	SignInComponent =
	    <div>Logged in as user, {props.auth.email}.
	    <ul>
	    <NavLink to="/admin"><li>Manage your datasets</li></NavLink>
	    <NavLink to="/app"><li>View your datasets in the DNA microscope</li></NavLink>
	    <a href="#" onClick={props.signOut}><li>Sign out</li></a>
	</ul>
	</div>;
    } else {
	SignInComponent = <StyledLoginLink href="#" className="login" onClick={props.signIn}>
	    <div  className="login-container">
	      Log in with Google
	    </div>
	</StyledLoginLink>;	
    }
    
    return (
	<StyledHomeLoginCard>
	  {SignInComponent}
	</StyledHomeLoginCard>
    );
}

const mapStateToProps = ({auth})=>{return{auth};};
export default connect(mapStateToProps, {signIn, signOut})(HomeLoginCard);



const StyledHomeLoginCard = styled.div`
left:50%;
position:relative;
transform:translate(-50%, 0%);
width:400px;
border:2px solid;
border-radius:20px;
padding:10px;

ul {
padding:0px;
li{
list-style:none;
}
}
`;


const StyledLoginLink = styled.a`
`;
