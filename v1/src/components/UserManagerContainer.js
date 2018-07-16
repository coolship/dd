import React, { Component } from 'react';
import { connect } from "react-redux";
import UserManager from "./UserManager";

class UserManagerContainer extends Component {
    render(){return(<UserManager/>)}
}

function mapStateToProps({}){return {};}

export default connect(mapStateToProps, { })(UserManagerContainer) 
