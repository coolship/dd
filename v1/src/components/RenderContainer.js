//react architecture
import React, { Component } from 'react';

export default class RenderContainer extends Component {
    constructor(props){
	super(props);
	console.log('calling super');
	this.backend_ref=React.createRef();
	this.view_ref=React.createRef();
    }
}
