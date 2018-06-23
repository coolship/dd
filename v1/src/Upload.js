import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';


const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};


class Upload extends Component {

    constructor(props){
	super(props);

	this.state = {
	    modalIsOpen: false
	};

	this.openModal = this.openModal.bind(this);
	this.afterOpenModal = this.afterOpenModal.bind(this);
	this.closeModal = this.closeModal.bind(this);
    }
    componentDidMount(){

    }
    render(){
	return <div className="">

	
    }
    
}
