import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import DatasetStageContainer from './DatasetStageContainer';
import {Dataset} from "../data/Dataset";
import _ from "lodash";
import { uploadBuffer } from "../actions/FileIO";
import {connect} from "react-redux";
import ProgressContainer from "../display/ProgressContainer";


class DatasetLoadingContainer extends Component {
    constructor(props){
	super(props);
	this.state= {
	    progress:0,
	    dataset_fetched_name:null,
	};
    }
    
    fetchDataset(resolve) {
	const metadata = this.props.metadata;
	var that = this;
	var url = metadata.downloadUrl;
	
	that.setState({loading_progress:5,
		       loading_status:"fetching dataset from server"});

	if(false ){//metadata.RBUFFER_url){
	    /* we have processed buffer data, initialize the dataset directly */

	    //this part is not necssary, but for now we're keeping around
	    //the coordinates, just to initialize the kd tree.
	    //still not setting "annotations_url"
	    fetch(url).then(function(response) {
			console.log(response)
		return response.json();
	    }).then(function(myJson) {
		const coords_data = myJson;
		that.setState({loading_progress:20,
			       loading_status:"creating view from preloaded buffer",
			       dataset: new Dataset(metadata.dataset,
						    coords_data,
						    metadata.annotations_url)}
			     );

		console.log("INITILIZED WITH BUFFER");
		//console.log(that.state.dataset);
		//throw "hi"
		resolve();

	    }).catch((err)=>{throw err;});
	    
	} else{


	    /* no process buffer data. Download unprocessed coordinates and annotations */
	    fetch(url).then(function(response) {

		return response.json();
	    }).then(function(myJson) {
		const coords_data = myJson;
		that.setState({loading_progress:20,
			       loading_status:"creating microscope view",
			       dataset: new Dataset(metadata.dataset,
						    coords_data,
						    metadata.annotations_url)}
			     );
		resolve();

	    }).catch((err)=>{throw err;});
	}

    };

    
    resetDataset(){
	const that = this;
	that.resetting=true;
	console.log("BEGINNING RESET")

	this.setState({"dataset_fetched_name":null,
			   dataset:null});
			   console.log("SETSTATE!")
/*
	var p = new Promise(resolve =>{
	    that.fetchDataset(resolve);
	}).then(function(result){
	    return new Promise(resolve=>{
		that.state.dataset.initializeFromBuffers(
		    (loading_progress,loading_status)=>{that.setState({loading_progress:loading_progress* .5+20,loading_status})},
		    ()=>{
			that.setState({
			    dataset_fetched_name:that.props.which_dataset,
			    loading_progress:100,
			    loading_status:"complete",
			});
			if(that.props.onReadyHandler){that.props.onReadyHandler();}

			console.log("completed initiliazition from buffers");
			resolve();
		    },
		    that.props.metadata
		);
		resolve();
	    });
		   
	}).then(function(){
	    
	    console.log("DONE RESETTING");
	    console.log(that)
	    console.log(that.state.dataset);
	    that.resetting=false;
	});
*/
	
	
	 var p = new Promise(resolve=>{
	 that.fetchDataset(resolve);
	}).then(function(result){
	    
	    return new Promise(resolve=>{
		if(false){//that.props.metadata.RBUFFER_url){
		    that.state.dataset.initializeAsyncWithBuffers(
			(loading_progress,loading_status)=>{
			    that.setState({loading_progress:loading_progress* .5+20,loading_status});
			},
			()=>{
			    that.setState({
				dataset_fetched_name:that.props.which_dataset,
				loading_progress:100,
				loading_status:"complete",
			    });
			    if(that.props.onReadyHandler){that.props.onReadyHandler();}
 
			    resolve();
			},
		    );
		} else {
			//[TODO] fix the mount / unmount issue in DNAMicroscope load which makes this check necessary.
			
			if(!that.state.dataset){return}
		    that.state.dataset.initializeAsync(
			(loading_progress,loading_status)=>{
			    that.setState({loading_progress:loading_progress* .5+20,loading_status});
			},
			()=>{
			    that.setState({
				dataset_fetched_name:that.props.which_dataset,
				loading_progress:100,
				loading_status:"complete",
			    });
			    if(that.props.onReadyHandler){that.props.onReadyHandler();}

			    
			     for (let nm of ["r","g","b","a","r_seg","g_seg","b_seg","a_seg","x","y","z"]){
				 console.log(nm)
				 console.log("NM@")
			     
			     that.props.uploadBuffer(that.props.metadata_key,
			     that.props.metadata,
			     nm.toUpperCase()+"BUFFER",
			     that.state.dataset[nm]
			     );
			     }
			     
			    resolve();
			},
		    );
		}
		});
			     
	}).then(function(){
	    that.resetting=false;
	});
	 
    }
	componentWillUnmount(){
		console.log("UNMOUNTING!?")
	}
    componentDidMount(){
		console.log("DIDMOUNT")
    	if(this.props.which_dataset != this.state.dataset_fetched_name){
	    if(!this.resetting){this.resetDataset()}
	}
    };
    
    componentDidUpdate(){
		console.log("DIDUPDATE")
	if(this.props.which_dataset != this.state.dataset_fetched_name){
	    if(!this.resetting){this.resetDataset();}
	}	
	console.log("DONEUPDATE")
    }

    render(){
	if(this.props.which_dataset != this.state.dataset_fetched_name){
	    return (
		<LoadingScreen>    
		<h1>Loading Dataset, {this.props.which_dataset}</h1>
		<ProgressContainer progress={this.state.loading_progress}>
		  <span className="fill" ></span>
		  <div className="message">{this.state.loading_status}</div>
		</ProgressContainer>		
		</LoadingScreen>);
	}  else {	   
	    return <DatasetStageContainer
	    dataset={this.state.dataset}
	    metadata={this.props.metadata}
	    metadata_key={this.props.metadata_key}
	    is_demo={this.props.is_demo}
	    appearance_props={{
		no_buttons:this.props.no_buttons?true:false
	    }}
		/>;
	}
    }
    
}



const mapStateToProps=({})=>{return {};};
export default connect(mapStateToProps,{uploadBuffer})(DatasetLoadingContainer);



const LoadingScreen=styled.div`
left:50%;
top:50%;
position:absolute;
transform: translate(-50%, -50%);
`;

