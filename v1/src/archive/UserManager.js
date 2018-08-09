import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from "lodash";
import styled, { css } from 'styled-components';

//REDUX ACTIONS
import { connect } from "react-redux";
import { uploadFiletypeWithCallbacks } from "../actions/FileIO";
import { fetchDatasets, closeModal} from "../actions";

//COMPONENTS
import Close from 'react-icons/lib/md/close';
import DatasetListItem from './DatasetListItem';

//CONSTANTS
import {MODALS} from "../layout";
import {FILETYPES} from "../actions/FileIO";




class UserManager extends Component {
    constructor(props){
	super(props);
	this.state={
	    form_email:props.auth?props.auth.email:"",
	    form_dataset_name:null,
	    form_file:null,
	    uploading:false,
	    upload_progress:50,
	};
    }
    
    componentWillMount(){
	Modal.setAppElement('body');
    }
    
    onChangeDatasetName(event){
	this.setState({form_dataset_name:event.target.value});
    }
    
    onChangeFile(event){
	this.setState({form_file:event.target.files[0]});
    }
    
    onFormSubmit(event){
	var callbacks = {
	    progress:(progress)=>{
		console.log("submitted", progress);
		this.setState({upload_progress:progress});
	    },
	    complete:()=>this.setState({uploading:false}),
	};
	this.props.uploadFiletypeWithCallbacks(
	    this.state.form_file,
	    FILETYPES.DATASET,
	    {dataset:this.state.form_dataset_name,
	     email:this.state.form_email,
	     key:null},
	    callbacks);
	this.setState({uploading:true});
	event.preventDefault();
	return false;
    }
    renderDatasets(){	
	if(this.props.datasets){
	    
	    return _.map(this.props.datasets, function (value, key) {
		return <DatasetListItem key={key} todoId={key} email={value.email} size={value.size} which_dataset={value.dataset} />;		
	    });
	} else {
	    return <div>No datasets fetched from the server!</div>
	}
    }

    renderUpload(){
	if(this.state.uploading){
	    return (
		<StyledProgress progress={this.state.upload_progress +"%"}>
		  <div className="fill"></div>
		</StyledProgress>
	    );

	}else{
	    return (
		<StyledForm onSubmit={this.onFormSubmit.bind(this)} target="#">
		  <ControlsList>
		    <ControlLabel className="email">
		      <LL>user:</LL>
		      <LR><input type="text" readOnly="true" value={this.props.auth ? this.props.auth.email : "no email"} required/></LR>
		    </ControlLabel>
		    <ControlLabel className="name">
		      <LL>dataset name: </LL>
		      <LR><input onChange={this.onChangeDatasetName.bind(this)} type="text" name="name" required/></LR>
		    </ControlLabel>
		    <ControlLabel className="upload">
		      <LL>choose a file:</LL>
		      <LR><input onChange={this.onChangeFile.bind(this)} type="file" required /></LR>
		    </ControlLabel>
		    <ControlLabel>
		      <button type="submit">submit</button>
		    </ControlLabel>
		  </ControlsList>
		</StyledForm>
	    );
	}
    }
    
    render(){
	var datasets = this.renderDatasets();
	var upload = this.renderUpload();

	return(
	    <Modal
               isOpen={this.props.app.modal==MODALS.USER_MANAGER }
               style={customStyles}
	       contentLabel="Google Login"
	       >
	      <div className="user-manager modal">
	    	<Close className="icon icon-close" onClick={this.props.closeModal} />
		<h2>Create new dataset</h2>
		{upload}
		<h2>Existing datasets</h2>
		{datasets}
	      </div>
	    </Modal>
	);
    }
}


function mapStateToProps({datasets,auth,app}){return { datasets , auth, app };}
export default connect(mapStateToProps, { fetchDatasets, uploadFiletypeWithCallbacks, closeModal } )(UserManager); 


const StyledProgress=styled.div`
width:100%;
position:relative;
border:2px solid;
border-radius:3px;
height:10px;
    .fill{
	height:100%;
	display:block;
	background-color:white;
	width: ${props => props.progress};
      }
`;

const StyledForm = styled.form``;
const ControlsList = styled.div``;
const ControlLabel = styled.label`
    margin-top: 5px;
    display: block;
`;

const LL=styled.span`
width:200px;
display:inline-block;
`;
const LR=styled.span``;



const customStyles = {
    content: {
	top: '50%',
	left: '50%',
	right : 'auto',
	bottom: 'auto',
	marginRight: '-50%',
	width: '600px',
	height:'400px',
	transform: 'translate(-50%, -50%)',
	border:"2px solid",
	borderRadius:"5px",
	backgroundColor:'rgba(0, 0, 0, 1)',
	color:"white",	
    },  
    overlay: {
	backgroundColor:'rgba(0, 0, 0, .75)',

    }
};



