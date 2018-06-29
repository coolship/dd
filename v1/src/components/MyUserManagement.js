import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from "lodash";

import Close from 'react-icons/lib/md/close';


import { uploadFromForm } from "../actions/FileIO";
import { fetchDatasets } from "../actions";
import { connect } from "react-redux";

const customStyles = {
    content : {
	top                   : '50%',
	left                  : '50%',
	right                 : 'auto',
	bottom                : 'auto',
	marginRight           : '-50%',
	width: '400px',
	height:'250px',
	transform             : 'translate(-50%, -50%)',

	border:"2px solid",
	borderRadius:"5px",
        color: 'white',
	backgroundColor:'rgba(0, 0, 0, 1)',
	padding:'50px',
	

	
    },
    
    overlay: {
	backgroundColor:'rgba(0, 0, 0, .75)',

    }
};


class DatasetViewItem extends Component {
    render(){
	return <div className="dataset-item">{this.props.dataset}, created by {this.props.email} </div>
    }
}

class MyUserManagement extends Component {
    constructor(props){
	super(props)

	this.state={
	    form_email:props.auth?props.auth.email:"",
	    form_dataset_name:null,
	    form_file:null,
	}

	
	
    }


    componentWillMount(){
	Modal.setAppElement('body');
    }

    
    onChangeDatasetName(event){
	this.setState({form_dataset_name:event.target.value})
    }
    
    onChangeFile(event){
	this.setState({form_file: event.target.files[0]})
    }
    
    onFormSubmit(event){
	this.props.uploadFromForm(this.state.form_file,this.state.form_dataset_name, this.state.form_email)
    }
    
    renderDatasets(){	
	const { datasets } = this.props;
	if(datasets){
	    
	    return _.map(datasets, function (value, key) {
		return <DatasetViewItem key={key} todoId={key} email={value.email} size={value.size} dataset={value.dataset} />;		
	    });
	} else {
	    return <div>No datasets fetched from the server!</div>
	}
    }
    
    render(){
	return(
		<Modal
            isOpen={ !this.props.closed }
            style={customStyles}
	    contentLabel="Google Login"
	    	>

	    <div className="user-manager">
	    		<Close className="icon icon-close" onClick={this.props.onClose} />
	    	<div>
		{this.renderDatasets()}
	    </div>
		<form >
		<h2>Upload dataset</h2>
		<label className="email">user: <input type="text" readOnly="true" value={this.props.auth ? this.props.auth.email : "no email"}/></label>
		<label className="name">dataset name: <input onChange={this.onChangeDatasetName.bind(this)} type="text" name="name"/></label>
		<label className="upload"><input onChange={this.onChangeFile.bind(this)} type="file"  /></label>
		<label><button type="button" onClick={this.onFormSubmit.bind(this)}>submit</button></label>
	    
	    </form>
		</div>
		</Modal>
	)
    }
}



function mapStateToProps( state ) {
    const { datasets, auth, app } = state;
    return { datasets , auth, app };
}



export default connect(mapStateToProps, { fetchDatasets, uploadFromForm } )(MyUserManagement) 
