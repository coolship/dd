import React, { Component } from 'react';
import { connect } from "react-redux";
import { uploadXumi } from "../actions/FileIO";
import DatasetDropForm from "../Admin/DatasetDropForm";
import styled, { css } from 'styled-components';




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

function withXumiUpload(WrappedComponent) {

  return connect(({ auth }) => { return { auth }; }, { uploadXumi })(
    class extends Component {
      constructor(props) {
        super(props);
        this.state = { files: {} };
      }

      handleDrop(event) {
        event.preventDefault();

        const addFile = (file, name) => {
          this.setState({ files: Object.assign(this.state.files, { [name]: file }) });
          console.log(this.state.files);
          if (this.isReady()) {
            this.autoSubmit();
          }
        }

        var items = event.dataTransfer.items;
        for (var i = 0; i < items.length; i++) {

          // webkitGetAsEntry is where the magic happens
          var folder = items[i].webkitGetAsEntry();
          if (folder) {
            if (!folder.isDirectory) { throw Error("please drop a directory"); }
            const r = folder.createReader();
            this.setState({ "dataset_name": String(Math.random()).slice(2) });

            //starts an async read process to look through the folder system
            r.readEntries((entries) => {
              for (var i = 0; i < entries.length; i++) {
                var item = entries[i];
                if (item.name.includes("segment")) {
                  if (item.name.includes("feat")) {
                    item.file(file => addFile(file, "segment_feat_file"))
                  } else if (item.name.includes("_data")) {
                    item.file(file => addFile(file, "segment_base_file"))
                  }
                } else if (item.name.includes("feat_Xumi_smle")) {
                  item.file(file => addFile(file, "feat_file"))
                } else if (item.name.includes("Xumi_smle_data")) {
                  item.file(file => addFile(file, "base_file"))
                } else {
                  console.log("skipping unrecognized file " + item.name);
                }
              }

            });
          }
        }
      }

      isReady() {
        console.log(this.state.files.base_file && this.state.files.feat_file && this.state.files.segment_feat_file && this.state.files.segment_base_file)
        return this.state.files.base_file && this.state.files.feat_file && this.state.files.segment_feat_file && this.state.files.segment_base_file
      }


      autoSubmit() {

        //ev.preventDefault();
        //callbacks to update state
        var callbacks = {
          progress: (progress) => {
            this.setState({ progress: progress });
          },
          complete: () => {
            this.setState({
              dataset_name: null,
              files: {},
            });
            this.setState({ status: "complete", progress: 100 });
          },
        };

        //upload method using global redux store
        this.props.uploadXumi(
          this.state.files,
          {
            dataset: this.state.dataset_name,
            email: this.props.auth.email,
            key: null
          },
          callbacks);

        //return false;


      }
      validateForm(event) {

      }
      distributeFiles(event) {

      }
      render() {
        // Filter out extra props that are specific to this HOC and shouldn't be
        // passed through
        const { auth, ...passThroughProps } = this.props;
        let passThroughState = {
          progress: this.state.progress,
          state: this.state.state,
          base_file: this.state.files.base_file,
          feat_file: this.state.files.feat_file,
          segment_base_file: this.state.files.segment_base_file,
          segment_feat_file: this.state.files.segment_feat_file,
          dataset_name: this.state.dataset_name
        };

        // Inject props into the wrapped component. These are usually state values or
        // instance methods.
        const handleDrop = this.handleDrop.bind(this);
        //const handleSubmit = this.handleSubmit.bind(this);

        // Pass props to wrapped component
        return (
          <WrappedComponent
            handleDrop={handleDrop}
            //handleSubmit={handleSubmit}
            progress={this.state.progress} /* 0-100 with upload progress */
            status={this.state.status} /* short string with user-friendly status */
            {...passThroughState}
            {...passThroughProps}
          />
        );
      }
    });
}


class UploadV2View extends Component {
  render(props) {
    return (
      <div>
        <section><h1>upload datasets</h1>
          <XumiDropperContainer />
        </section>
      </div>
    );
  };
}


function XumiDropperView(props) {
  /* strips props from the container which will be used to handle events */

  const { handleDrop, handleSubmit, progress, dataset_name, status, base_file, feat_file, segment_base_file, segment_feat_file,
    ...passedProps } = props;
  return (
    <StyledUploadForm
      {...passedProps}>
      <div className="status">status: {status}</div>
      <div>progress: {status}</div>
      <div>dataset_name: {dataset_name}</div>
      <div>base_file: {base_file ? base_file.name : "no base file selected"}</div>
      <div>feat_file: {feat_file ? feat_file.name : "no feature file selected"}</div>
      <div>segmentation_base_file: {segment_base_file ? segment_base_file.name : "no segmentation base file selected"}</div>
      <div>segmentation_feat_file: {segment_feat_file ? segment_feat_file.name : "no segmentation feature file selected"}</div>
      <input type="file"
        name="file"
        id="file"
        onDrop={handleDrop}
      />
    </StyledUploadForm>
  );
}

let XumiDropperContainer = withXumiUpload(XumiDropperView);

const StyledUploadForm = styled.form`
.status{color:red;}
`;


const mapStateToProps = ({ auth }) => { return { auth }; };
export default connect(mapStateToProps, {})(UploadV2View);