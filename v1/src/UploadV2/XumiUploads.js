import styled, { css } from "styled-components";
import React, { Component } from "react";
import ProgressContainer from "../display/ProgressContainer";
import _ from "lodash";
import withXumiUpload from "./WithXumiUploadHOC";

/** HANDLE XUMI FILE UPLOADS
 * User drags folder on to drop zone for client side form validation.
 * Upon form validation, uploads to firebase in files:
 *     /[datasetID]/xumi_data
 *     /[datasetID]/xumi_features
 * Server listens and processes the data
 * Server sets a flag on the Dataset object in firebase, at which time client has access to
 * raw data in previous format. Client accesses this data and processes in javascript (display)
 * optimized formats, allowing rapid access of channels served by Google Cloud
 */

class XumiDropperView extends Component {
  constructor(props) {
    /* strips props from the container which will be used to handle events */
    super(props);
    this.state = {};
  }
  onDragOver(event){

    console.log(this)
    console.log("DRAGGED OVER")
    this.setState({ dragging: true });
  event.preventDefault();
  }
  render() {
    const {
      handleDrop,
      handleSubmit,
      handleNameChange,
      progress,
      dataset_display_name,
      dataset_name,
      status,
      base_file,
      feat_file,
      segment_base_file,
      segment_feat_file,
      files,
      submit_state,
      className,
      ...passedProps
    } = this.props;



    if (submit_state == "waiting") {
      return (
        
        <label
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
              Drag folder or click here to choose a Dataset folder for upload.
              Dataset folder should contain four files exported by the DNA
              Microscopy sequencing toolkit.
            </p>
            <input
              type="file"
              name="file"
              id="file"
              style={{ display: "none" }}
            />
          </label>

      );
    } else if (submit_state == "has_bad_files") {
      return (
        <div className={className}>
          <h3>There seems to be some trouble!</h3>
          <span>Please choose a directory with four files:</span>
          <ul>
            <li>"final_feat_Xumi_segment[...].csv</li>
            <li>"final_feat_Xumi_smle[...].csv</li>
            <li>"final_Xumi_segment[...].csv</li>
            <li>"final_Xumi_smle[...].csv</li>
          </ul>
        </div>
      );
    } else if (submit_state == "has_files") {
      const out = (
        <div className={className}>
          <div>Choose dataset name</div>
          <input
          className="dataset_name"
            type="text"
            value={dataset_display_name}
            onChange={handleNameChange}
            ref={(input) => { this.nameInput = input; }} 
          />
          <button className="dataset_submit" value="submit" onClick={handleSubmit}>
            SUBMIT
          </button>
          <br/>
          Files:
          <div className="file_desc"> {base_file.name} </div>
          <div className="file_desc"> {feat_file.name}</div>
          <div className="file_desc"> {segment_base_file.name}</div>
          <div className="file_desc"> {segment_feat_file.name}</div>
        </div>
      );
      return Wrapper(out);
    } else {
      return "UNKNOWN SUBMIT STATE";
    }
  }
  componentDidUpdate(){
      if(this.nameInput && !(this.state.hasSelected)){

    this.nameInput.select();
    this.setState({hasSelected:true})
      } 
 }
}

const color="lightblue";
const ItemWrapper = styled.span`

`
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

  .file_desc {
    width: 75%;
    padding-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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


const WrapItem = wrapped_component => {
    return <ItemWrapper>{wrapped_component}</ItemWrapper>;
  };
  

let XumiDropperContainer = withXumiUpload(XumiDropperView);
export default XumiDropperContainer;
