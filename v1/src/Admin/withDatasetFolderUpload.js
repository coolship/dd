import React, { Component } from 'react';
import { connect } from "react-redux";
import { uploadCoordsAndAnnotationsWithCallbacks } from "../actions/FileIO";



/*
higher order container component providing an upload handler for the onSubmit event of this form,
which should accept a named folder, having as children two files
 -- coords.json.gz
 -- annotations.json.gz

this HOC takes that folder, checks the file names and sets them as values for "coords" and "annotations" objects of the underlying HTML form, validated by the required object
 */



//withUpload object handles file dropping and validation of the files
export default function withDatasetFolderUpload(WrappedComponent){
    
    return connect(({auth})=>{return {auth};}, { uploadCoordsAndAnnotationsWithCallbacks })(
	class extends Component {
	    constructor(props){
		super(props);
		this.state={};
	    }
	    
	    handleDrop(event) {
		event.preventDefault();

		var items = event.dataTransfer.items;
		for (var i=0; i<items.length; i++) {
		    
		    // webkitGetAsEntry is where the magic happens
		    var folder = items[i].webkitGetAsEntry();
		    if (folder) {
			if (!folder.isDirectory){throw Error("please drop a directory");}
			const r = folder.createReader();
			this.setState({"dataset_name":folder.name});
			
			//starts an async read process to look through the folder system
			r.readEntries((entries)=>{
			    for(var i = 0; i < entries.length ;i++){
				var item = entries[i];
				if(item.name=="coords.json.gz"){	    
				    item.file((file)=>{ 
					this.setState({"coords_file": file});
				    });
				} else if(item.name=="annotations.json.gz"){
				    item.file((file)=>{ 
					this.setState({"annotations_file": file});
				    });
				} else{
				    throw Error("unrecognized file " + item.name);
				}
			    }
			    if(this.isReady()){
				this.submit();
			    }
			});
		    }
		}
	    }

	    isReady(){
		return this.state.annotations_file && this.state.coords_file;
	    }
	    
	    
	    submit(){
		//callbacks to update state
		var callbacks = {
		    progress:(progress)=>{
			console.log("submitted, progress: ", progress);
			this.setState({progress:progress});
		    },
		    complete:()=>{
			this.setState();
			this.setState({status:"complete"});
		    },
		};

		//upload method using global redux store
		this.props.uploadCoordsAndAnnotationsWithCallbacks(
		    this.state.coords_file,
		    this.state.annotations_file,
		    {dataset:this.state.dataset_name,
		     email:this.props.auth.email,
		     key:null},
		    callbacks);
		 
		
	    }
	    validateForm(event){
		
	    }
	    distributeFiles(event){

	    }
	    render(props) {
		// Filter out extra props that are specific to this HOC and shouldn't be
		// passed through
		const {auth, ...passThroughProps } = this.props;
		const passThroughState={progress:this.state.progress,
					state:this.state.state,
					coords_file:this.state.coords_file,
					annotations_file:this.state.annotations_file,
					dataset_name:this.state.dataset_name};

		// Inject props into the wrapped component. These are usually state values or
		// instance methods.
		const handleDrop = this.handleDrop.bind(this);

		
		// Pass props to wrapped component
		return (
		    <WrappedComponent
		       handleDrop={handleDrop}
		       progress={this.state.progress} /* 0-100 with upload progress */
		       status={this.state.status} /* short string with user-friendly status */
		       {...passThroughState}
		       {...passThroughProps}
		       />
		);
	    }
	});


}
