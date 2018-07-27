import React, { Component } from 'react';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';
import _ from 'lodash';
import Add from 'react-icons/lib/md/add';
import Close from 'react-icons/lib/md/close';
import { FILETYPES, deleteDataset, deleteAnnotation, uploadFiletypeWithCallbacks } from "../actions/FileIO";



class AddRemoveUmisButtonComponent extends Component {
    constructor(props){
	super(props);
	this.state = {upload_progress:0};
    }
    onDeleteUmis(event){
	const meta = _.find(this.props.datasets,(e)=>e.dataset==this.props.which_dataset);
	this.props.deleteAnnotation(meta,FILETYPES.UMIS);
    }

    onChangeUmis(event){
	const meta = _.find(this.props.datasets,(e)=>e.dataset==this.props.which_dataset);	
	this.props.uploadFiletypeWithCallbacks(
	    event.target.files[0],
	    FILETYPES.UMIS,
	    meta,
	    {
		progress:(progress)=>this.setState({upload_progress:progress}),
		complete:()=>console.log("completed")
	    }
	);				
    }
    render(){
	const meta = _.find(this.props.datasets,(e)=>e.dataset==this.props.which_dataset);
	if(!meta){return null;}

	if(meta.umis_url){
	    
	    return(<PaddedButton onClick={this.onDeleteUmis.bind(this)} className="button-label umis upload-umis uploaded"><Close className="icon"/><span  className="icon-label">UMI DATA</span></PaddedButton>);
	    
	} else {
	    return (<PaddedButton><label className="button-label umis upload-umis"><Add className="icon"/><span className="icon-label">UMI DATA</span><input onChange={this.onChangeUmis.bind(this)} type="file"/></label><ProgressFill progress={this.state.upload_progress}/></PaddedButton>);
	}
    }
}

class AddRemoveTypesButtonComponent extends Component {

    onChangeTypes(event){
	this.props.uploadFiletypeWithCallbacks(event.target.files[0],
					       FILETYPES.TYPES,
					       this.getMetadata(),
					       {progress:()=>console.log("progress"),
						complete:()=>console.log("completed")}
					      );
    }
    onDeleteTypes(event){
	this.props.deleteAnnotation(this.getMetadata(),FILETYPES.TYPES);
    }
    getMetadata(){return _.find(this.props.datasets,(e)=>e.dataset==this.props.which_dataset);}
    render(){
	var meta = this.getMetadata();
	if(!meta){return null;}
	
	if(meta.types_url){	
	    return (
		<PaddedButton onClick={this.onDeleteTypes.bind(this)}
			      className="types upload-types uploaded">
		  <Close className="icon"/>
		  <span   className="icon-label">TYPES INFO</span>
		</PaddedButton>);
	} else{
	    return (
		<PaddedButton>
		 <label className="types upload-types">
		  <Add className="icon"/>
		  <span className="icon-label">TYPES INFO</span>
		  <input onChange={this.onChangeTypes.bind(this)} type="file"/>
		 </label>
		</PaddedButton>);	    
	}
    }
}

class DeleteDatasetButtonComponent extends Component{

    render(){
	return <DeleteButton onClick={this.deleteDataset.bind(this)}><Close className="icon"/></DeleteButton>;
    }
    getMetadata(){return _.find(this.props.datasets,(e)=>e.dataset==this.props.which_dataset);}
    deleteDataset(){this.props.deleteDataset(this.getMetadata());}   
}


function mapStateToProps({dataset,datasets,auth}){
    return {dataset,datasets,auth};
}
export const AddRemoveUmisButton = connect(mapStateToProps,{  deleteAnnotation, uploadFiletypeWithCallbacks}) (AddRemoveUmisButtonComponent);

export const AddRemoveTypesButton = connect(mapStateToProps,{ deleteAnnotation, uploadFiletypeWithCallbacks}) (AddRemoveTypesButtonComponent);

export const DeleteDatasetButton = connect(mapStateToProps,{ deleteDataset}) (DeleteDatasetButtonComponent);



const ProgressFill=styled.div`
position:absolute;
left:0px;
top:0px;
bottom:0px;
background-color:blue;
right:${props => 100 - props.progress}%;
pointer-events:none;


`;
const PaddedButton=styled.span`
input[type=file]{
    display:none;
}	    
position:relative;
display:inline-block;
margin-bottom:5px;
border:2px solid;
border-radius:3px;
padding:1px;
text-align:center;
vertical-align:middle;
width: 150px;
margin-right: 10px;
cursor:pointer;

&.uploaded{
background-color:blue;
}
svg{
	margin-top:-3px;

}
&:hover{
	background-color:white;
	color:black;
	opacity:.8;	
}
.icon-label{
	display:inline-block;
	padding-top:3px;
	padding-right:10px;
}
.icon{
font-size:1.5em;
}
`;


const DeleteButton=PaddedButton.extend`
background-color:red;
`;

