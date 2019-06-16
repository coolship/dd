//react architecture
import React, { Component } from 'react';

export default class RenderContainer extends Component {
    constructor(props){
	super(props);
	this.backend_ref=React.createRef();
	this.view_ref=React.createRef();
	this.self_ref=React.createRef();
	this.canvas_container_ref=React.createRef();


}
}
