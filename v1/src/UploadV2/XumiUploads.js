import styled, { css } from "styled-components";
import React, { Component } from "react";
import { connect } from "react-redux";
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

var onDragOver = event => {
  event.preventDefault();
};

var isAdvancedUpload = (function() {
  var div = document.createElement("div");
  return (
    ("draggable" in div || ("ondragstart" in div && "ondrop" in div)) &&
    "FormData" in window &&
    "FileReader" in window
  );
})();

class XumiDropperView extends Component {
  constructor(props) {
    /* strips props from the container which will be used to handle events */
    super(props);
    this.state = {};
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
        <StyledUploadForm
          {...passedProps}
          className={className}
          onDragEnter={e => {if (!this.state.dragging){this.setState({dragging: true })};}}
          onDragEnter={e => {if (this.state.dragging){this.setState({dragging: false })};}}
        >
          <label
            htmlFor="file"
            className="fillsarea"
            onDragOver={onDragOver}
            onDrop={handleDrop}
            style={{
                position: absolute;
                left: 0px;
                right: 0px;
                top: 0px;
                bottom: 0px;
              }}

          >
            <p><span style={{fontSize:36}}>+</span></p>
            <p>Drag folder or click here to choose a Dataset folder for upload. 
                Dataset folder should contain four files exported by the 
                DNA Microscopy sequencing toolkit.</p>
            <input
              type="file"
              name="file"
              id="file"
              style={{ display: "none" }}
            />
          </label>
        </StyledUploadForm>
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
      const out = 
        <div className={className}>
          <div>Choose dataset name</div>
          <input
            type="text"
            value={dataset_display_name}
            onChange={handleNameChange}
          />
          <button value="submit" onClick={handleSubmit}>
            SUBMIT
          </button>
          <div className="file_desc"> {base_file.name} </div>
          <div className="file_desc"> {feat_file.name}</div>
          <div className="file_desc"> {segment_base_file.name}</div>
          <div className="file_desc"> {segment_feat_file.name}</div>
        </div>
      return Wrapper(out);
    } else {
      return "UNKNOWN SUBMIT STATE";
    }
  }
}

const StyledWrapper = styled.div`
.file_desc {
    width: 100%;
    padding-right: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
const Wrapper = ( wrapped_component ) => {
return <StyledWrapper>{wrapped_component}</StyledWrapper>
}



let XumiDropperContainer = withXumiUpload(XumiDropperView);
export default XumiDropperContainer;
