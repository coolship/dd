import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import DatasetContainer from './DatasetContainer';
import {Dataset} from "../data/Dataset";
import _ from "lodash";


export default class DatasetLoadingContainer extends Component {
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


    };

    
    resetDataset(){
	var that = this;
	that.resetting=true;
	this.setState({"dataset_fetched_name":null,
		       dataset:null});
	var p = new Promise(resolve=>{
	    that.fetchDataset(resolve);
	}).then(function(result){
	    
	    return new Promise(resolve=>{
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
			resolve();
		    }
		);
	    });
	}).then(function(){
	    that.resetting=false;
	});
    }

    componentDidMount(){
    	if(this.props.which_dataset != this.state.dataset_fetched_name){
	    if(!this.resetting){this.resetDataset()}
	}
    };
    
    componentDidUpdate(){
	if(this.props.which_dataset != this.state.dataset_fetched_name){
	    if(!this.resetting){this.resetDataset();}
	}	
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
	    return <DatasetContainer
	    dataset={this.state.dataset}
	    metadata={this.props.metadata}
	    metadata_key={this.props.metadata_key}
	    is_demo={this.props.is_demo}
		/>;
	}
    }
    
}


const LoadingScreen=styled.div`
left:50%;
top:50%;
position:absolute;
transform: translate(-50%, -50%);
`;


const ProgressContainer=styled.div`
position:relative;
height:40px;
width:100%;
border:2px solid;
border-radius:3px;

.fill{
background-color:rgba(0,0,255,.5);
height:100%;
position:absolute;
left:0px;
top:0px;
bottom:0px;
points-events:none;
right:${props => 100 - props.progress}%;
}
.message{
left:50%;
top:50%;
transform:translate(-50%, -50%);
position:absolute;
}
`;
