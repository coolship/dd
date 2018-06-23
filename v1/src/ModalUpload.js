import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import CloudUpload from 'react-icons/lib/md/cloud-upload';
import Close from 'react-icons/lib/md/close';


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


class ModalUpload extends Component {

    constructor(props){
	super(props);

	this.state = {
	    modalIsOpen: false,
	    hasFile:false
	};


	
	this.openModal = this.openModal.bind(this);
	this.afterOpenModal = this.afterOpenModal.bind(this);
	this.closeModal = this.closeModal.bind(this);


	this.fupload = React.createRef()
	this.modal=React.createRef()
    }

   

    openModal() {
	this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
	// references are now sync'd and can be accessed.
	this.subtitle.style.color = '#f00';
    }

    closeModal() {
	this.setState({modalIsOpen: false});
    }
    componentWillMount(){
	//Modal.setAppElement(ReactDOM.findDOMNode(this.props.appComponent));

	Modal.setAppElement('body');

    }

    onFormSubmit(event){
	this.uploadFile(event.target.files[0]);
    }

    onSelectFile(event){
	console.log("selected file")
	this.setState({"hasFile":true})
    }

    uploadFile(file){
	var token ="ya29.GlvhBUCJZ_SFVxQ6Q9D5HLHglkNpoNf1bw-yEkvcBBaBWTjs5RfLIH09a-BDNvyv7XWFssN2Y9yyIRKoE5mFzA7-VTFkkfW9YuaE1wlWo55d7vyeVTw38Fr7f1p4"

	var url = "https://www.googleapis.com/upload/storage/v1/b/slides.dna-microscopy.org/o?uploadType=multipart&name=datasets/001.json"

	fetch(url, { // Your POST endpoint
	    method: 'POST',
	    headers: {
		"Content-Type": "application/json",
		'Authorization': 'Bearer ' + token,

	    },
	    body: file // This is your file object
	}).then(
	    function(response){
		console.log(response)
		return response
	    } // if the response is a JSON object
	).then(
	    success => console.log(success) // Handle the success response object
	).catch(
	    error => console.log(error) // Handle the error response object
	);
    };


    render() {
	return (
		<div>
		<CloudUpload className="icon" onClick={this.openModal}/>
		<Modal
	    ref={this.modal}
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={customStyles}
            contentLabel="Example Modal"
	   
		>

		<h2 ref={subtitle => this.subtitle = subtitle}>upload a file</h2>
		<Close className="icon icon-close" onClick={this.closeModal} />
		<form className={"file-upload "+ (this.state.hasFile? "has-file": "needs-file")} onSubmit={this.onFormSubmit.bind(this)}>
		<input onChange={this.onSelectFile.bind(this)} type="file"  />
		<input type="submit"/>
		</form>
		</Modal>
		</div>
	);
    }
}



export default ModalUpload
