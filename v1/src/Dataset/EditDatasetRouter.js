
import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import { datasetsRef } from '../config/firebase';

import { fetchDatasets } from "../actions";
import { userIdFromEmail } from "../actions/FileIO";

import ProgressRing from "../widgets/ProgressRing";
import withFullUpload from "../UploadV2/WithFullUploadHOC";

import CloudDownload from "react-icons/lib/md/cloud-download";
import CreateNewFolder from "react-icons/lib/md/create-new-folder";
import SettingsApplications from "react-icons/lib/md/settings-applications";
import Folder from "react-icons/lib/md/folder";

import styled from "styled-components"
import _ from "lodash";
import {NavLink} from "react-router-dom";

import { connect } from "react-redux";

class EditDataset extends Component {
    constructor(props){
        super(props)
        console.log(this.props.which_dataset)
        if (!this.props.which_dataset){throw "no dataset in EditDataset"}

        this.state = {
            ...this.getDataset()
        }
        const range = { x0:0, y0:0, x1:.25, y1:.25}
        this.state.range = range;
    }

    componentDidCatch(error, info) {
        // Display fallback UI
        this.setState({ hasError: true });
        // You can also log the error to an error reporting service
        console.log("ERROR!!!")
      }
    

    onDragOver(event){
        this.setState({ dragging: true });
      event.preventDefault();
      }

 
    onFieldChange(change_field,val){
        
        datasetsRef.child("all_v2").child(this.getKey()).update({
            [change_field]:val
        }).then(()=>this.setState({[change_field]: val}))
    }

    setDetails=(details)=>this.setState({details:details})
    setSelection=(ids)=>this.setState({selection:ids})
    getKey(){return _.invert(_.mapValues(this.props.datasets,"dataset"))[this.props.match.params.number]}
    getDataset(){return this.props.datasets[this.getKey()]}
    render(){

        const {
            handleDrop,
            handleSubmit,
            status,
            data_file,
            key_file,
            params_file,
            files,
            submit_state,
            className,
            progress,
            ...passedProps
          } = this.props;

          let full_file_list;


            if (submit_state == "waiting") {
                full_file_list= (
                    <div>
                   <h3> <CreateNewFolder/> UEI Files</h3>
                  <label
                className="label-group"
                  htmlFor="file"
                  onDragOver={this.onDragOver.bind(this)}
                  onDrop={handleDrop}
                  style={{
                  }}
                
                    className={className + " " +(this.state.dragging?"dragover":"")}
                    onDragEnter={e => {
                      if (!this.state.dragging) {
                        this.setState({ dragging: true });
                      }
                    }}
                    onDragLeave={e => {
                      if (this.state.dragging) {
                        this.setState({ dragging: false });
                      }
                    }}
                    style={{
                      backgroundColor: this.state.dragging ? "rgba(0, 0, 255, .5)" : "transparent",
                      position: "relative",
                    left: "0px",
                    right: "0px",
                    top: "0px",
                    bottom: "0px"
                    }}
                    >
                  
                      <p>
                        <span style={{ fontSize: 120 }}>+</span>
                      </p>
                      <p>
                        Drag folder or click here to choose a UEI Dataset folder for upload.
                        UEI Dataset folder should contain three files, starting with:</p>
                        <ul><li>data_[...]</li><li>key_[...]</li><li>seq_params_[...]</li></ul>
                        <p>(Which are also inputs to the DNA Microscopy Processing pipeline)
                      </p>
                      <input
                        type="file"
                        name="file"
                        id="file"
                        style={{ display: "none" }}
                      />
                    </label>
                    </div>
          
                );
              } else if (submit_state == "has_bad_files") {
                full_file_list= Wrapper((
                  <div className={className}>
                    <h3>There seems to be some trouble!</h3>
                    <span>Please choose a directory with three files:</span>
                    <ul>
                      <li>"data[...].csv</li>
                      <li>"params[...].csv</li>
                      <li>"key[...].csv</li>
                    </ul>
                  </div>
                ));
              } else if (submit_state == "has_files") {
                full_file_list =(
                    <div>
                    <h3><CreateNewFolder/> UEI Files</h3><div className={className}>
                        <div className="file-list">
                    <div className="file_desc"> {data_file.name} </div>
                    <div className="file_desc"> {params_file.name}</div>
                    <div className="file_desc"> {key_file.name}</div>
                    </div>
                    <button className="dataset-submit inverted-button" value="submit" onClick={handleSubmit}>SUBMIT</button>

                  </div>
                  </div>
                );

              } else if (submit_state == "uploading"){
                full_file_list = Wrapper((
                  <div className={className}>
                    <div>full files uploading uploading {this.props.which_dataset}</div>
                    <ProgressRing
                    radius={60}
                    stroke={10}
                    progress={progress}
                  />
                  </div>
                ));

              } 
                else if (submit_state == "uploading"){
                    full_file_list = (
                    <div className={className}>
                      <div>{this.props.which_dataset} UPLOAD COMPLETE!</div>
                      <ProgressRing
                      radius={60}
                      stroke={10}
                      progress={100}
                    />
                    </div>
                  );
                  
              }else if (submit_state == "uploaded"){
                full_file_list= <div><h3><Folder/> UEI files</h3>
                    <ul className="file-list">

                    {_.map(_.omitBy(this.getDataset().allfiles,(e=>!e.includes("full"))),(e,i)=>
                    <div key={i}><a href={"https://storage.cloud.google.com/slides.dna-microscopy.org/"+e}><CloudDownload/>{i}</a></div>)}
                    </ul>
                </div>
              } else{
                  full_file_list =<div>Unknown full file submit state, "{submit_state}"</div>
              }
            


        return(
            
        <div className={this.props.className}>
            <div className="abs">
            <h1>{this.getDataset().display_name}</h1> 
            <p>ds ID: {this.props.match.params.number}</p>
            <p>uploaded: {(new Date(this.getDataset().creation_time)).toUTCString()}</p>


            {this.getDataset().server_process_status=="COMPLETE" ? 
            <span>
                    <ul>
                        <li>{this.state.stats?this.state.stats.n_umis:null} umis</li> 
                    </ul>
                    <img src={`${process.env.REACT_APP_API_URL}/dataset/${this.props.match.params.number}/preview2k`}/>
                    
                   <p/><NavLink to={"/workspace/"+this.getDataset().dataset}>default </NavLink> / <NavLink to={"/3d/"+this.getDataset().dataset}> 3d </NavLink></span> 
                    :null}

            <div>
                
                <div className="display-group"><h3><SettingsApplications/> Settings</h3>
                <li><label htmlFor="edit-name"        className="label-group">

            <span className="label">display name</span>
                <input id="edit-name" 
                className="bordered-input"
                type="text" 
                value={this.state.display_name}
                onChange={ev=>this.onFieldChange.bind(this)("display_name",ev.target.value)}/> 
            </label></li><li>
            <li><label htmlFor="edit-description"        className="label-group">
            <span className="label">description</span>
                <input id="edit-description" 
                className="bordered-input"
                type="text" 
                value={this.state.dataset_description}
                onChange={ev=>this.onFieldChange.bind(this)("dataset_description",ev.target.value)}
                /> 
            </label>
            </li>
            
            <label htmlFor="edit-process_transcriptome"        className="label-group">
            <span className="label">process whole transcriptome</span>
                <input id="edit-process_transcriptome" 
                className="bordered-input"
                type="checkbox" 
                checked={this.getDataset().dataset_process_transcriptome?true:false}
                onChange={ev=>this.onFieldChange.bind(this)("dataset_process_transcriptome",ev.target.checked)}
                />
            </label></li>
           
            </div>
            </div>

            <div><div className="display-group"><h3>Backend Server Processes</h3>
                {this.getDataset().server_job_statuses
                    ?_.map(this.getDataset().server_job_statuses,(e,k)=><li className={`one-line status-color ${e}`}>{k} -- {e}</li>)
                    :<li >Waiting for server availability<p><span className="loading"></span></p></li>}
            </div></div>

            <div>
                <div className="display-group"><h3><Folder/> Xumi files</h3>
            <ul className="file-list">
                "xumi files uploaded: "
                {_.map(_.omitBy(this.getDataset().allfiles,e=>!e.includes("xumi")),(e,i)=>
                <div key={i}><a href={"https://storage.cloud.google.com/slides.dna-microscopy.org/"+e}><CloudDownload/>{i}</a></div>)}
                </ul>
                </div>
            </div>
            <div><div className="display-group">{full_file_list}</div></div>
            </div>
            </div>
        )
    }
}

const WrappedEditDataset = withFullUpload(EditDataset)

class EditDatasetRouter extends Component{
    constructor(props){
        super(props)
        this.props.fetchDatasets(userIdFromEmail(this.props.auth.email))
    }

    uploadCompleteHandler(){
    }
    render(){



        if (Object.keys(this.props.datasets).length > 0) {

  


            return(
                <Switch>
                <Route title="List" exact path='/edit'
                render={()=><div className={this.props.className} >This would be a list of datasets</div>}
                    // render={(props) => <GalleryList {...props} demos={this.props.demos} />}
                />
                <Route path='/edit/:number'
                    render={(props) => 
                    <WrappedEditDataset  
                    handleUploadComplete={this.uploadCompleteHandler.bind(this)}
                    which_dataset={props.match.params.number}
                    className={this.props.className} {...props} 
                    datasets={this.props.datasets} />}
                />
            </Switch>
            )
              
            } else {
                return (
                    <div
                    
                        style={{
                        top: "50%",
                        left: "50%",
                        position: "absolute",
                        backgroundColor: "rgba(0,0,1,.25)",
                        border:"2px solid blue",
                        borderRadius:"5px",
                        padding:"20px",
                        transform: "translate(-50%, -50%)"
                    }}>
                        Authenticating user, hang tight!
                    </div>
                )
            }
    }
}

const StyledEditDatasetRouter = styled(EditDatasetRouter)`
margin-left: auto;
    margin-right: auto;
    position: relative;
    width: 50vw;


.one-line{
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.status-color{
    &.WAITING{
        color:yellow;
    }
    &.COMPLETE{
        color:green;
    }
    &.FAILED{
        color:red;
    }
}

.loading {
    font-size: 30px;
    }
    
    .loading:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    -webkit-animation: ellipsis steps(4,end) 900ms infinite;      
    animation: ellipsis steps(4,end) 900ms infinite;
    content: "…"; /* ascii code for the ellipsis character */
    width: 0px;
    }
    
    @keyframes ellipsis {
    to {
        width: 1.25em;    
    }
    }
    
    @-webkit-keyframes ellipsis {
    to {
        width: 1.25em;    
    }
    }

.inverted-button{
    border: 2px solid white;
    margin: 10px;
    padding: .25em;
    font-size: 120%;
    border-radius: 4px;
    background-color: black;
    filter: invert(100%);
    color: white;
    padding-left: 1em;
    padding-right: 1em;
}
.label-group{
    margin-top:.5em;
    display:block;
}
.bordered-input{
    background-color: transparent;
    color: inherit;
    padding: .25em;
    border: 2px solid white;
    border-radius: 4px;
    margin: .25em;
}

  .file_desc {
    width: 75%;
    padding-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    padding: 10px;
  }

.display-group{
    border:1px solid white;
    margin:10px;
    padding-bottom: 1em;
    h3{
    filter: invert(100%);
    margin: 0px;
    background-color: black;

    }
}
.file-list{
    margin-top:1em;
    font-style:bold;
}
.abs{
    z-index:1;
}

li{
    list-style:none;
}

ul{

    margin-left:0px;
    padding-left:0px;
}

.label{
    display:block;
    padding-top:8px;
}

.cell-dataset-3d-view-canvas{
    display:block;
    margin-left:auto;
    margin-right:auto;
}
`

//let FullUploadContainer = withXumiUpload(XumiDropperView);


const color="pink";
const StyledWrapper = styled.div`
display: flex;
justify-content: center;
flex-direction: column;
text-align: center;



>div{
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    
    align-items: center;
    justify-content: center;
}

  .dataset_submit{
    background-color:${color};
    color:black;
    border:none;
    width:20em;
    margin-bottom:10px;
    margin-left: auto;
    margin-right: auto;
    height: 2.5em;

  }
input.dataset_name{
    caret-color:${color};
    height:2.5em;
    color:${color}
    outline:none;
  background-color: transparent;
  border: 2px ${color} solid;
  border-radius: 3px;
  width: 20em;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  margin-bottom: 5px;
  box-sizing: border-box;
  padding: 10px;
  text-align: center;
}

`;
const Wrapper = wrapped_component => {
  return <StyledWrapper>{wrapped_component}</StyledWrapper>;
};


export default connect(({datasets,auth})=>{return {datasets,auth}},{fetchDatasets,userIdFromEmail})(StyledEditDatasetRouter)