import React from "react";
import styled from 'styled-components';
import { signIn } from "../actions";
import { connect } from "react-redux";



const LoginWithGoogle = (props)=>(
    <StyledLoginLink href="#" className="login" onClick={props.signIn}>
      <div  className="login-container">
	Log in with Google
      </div>
    </StyledLoginLink>
)

export default connect(()=>{return{}}, {signIn})(LoginWithGoogle);

const StyledLoginLink = styled.a`
max-width:250px;
    border: 2px solid;
    padding: 10px;
    border-radius: 5px;
    color: white;
    text-decoration: none;
    display: block;
    margin-top: 20px;    
&:hover {
    color: black;
    background-color: white; 
}
`;
