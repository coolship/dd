import styled, {css} from 'styled-components';
import React, {Component} from 'react';
import {connect} from "react-redux";
import {uploadXumi} from "../actions/FileIO";
import ProgressContainer from "../display/ProgressContainer";
import _ from "lodash";
import DatasetDropForm from "../Admin/DatasetDropForm";

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


var onDragOver = (event) => {
    event.preventDefault();
}


function withXumiUpload(WrappedComponent) {

    return connect(({auth}) => {
        return {auth};
    }, {uploadXumi})(class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                files: {}
            };
        }

        handleDrop(event) {
            console.log("HELLOOOO")
            event.preventDefault();

            const addFile = (file, name) => {
                this.setState({
                    files: Object.assign(this.state.files, {[name]: file})
                });
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
                    if (!folder.isDirectory) {
                        throw Error("please drop a directory");
                    }
                    const r = folder.createReader();
                    this.setState({
                        "dataset_name": String(Math.random()).slice(2)
                    });

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
            console.log(this)

            //ev.preventDefault(); callbacks to update state
            var callbacks = {
                progress: (progress) => {
                    this.setState({progress: progress});
                },
                complete: () => {
                    
                    this.setState({dataset_name: null, files: {}});
                    this.setState({status: "complete", progress: 100});
                }
            };

            //upload method using global redux store
            this
                .props
                .uploadXumi(this.state.files, {
                    dataset: this.state.dataset_name,
                    email: this.props.auth.email,
                    key: null
                }, callbacks);

            //return false;

        }
        validateForm(event) {}
        distributeFiles(event) {}
        render() {
            // Filter out extra props that are specific to this HOC and shouldn't be passed
            // through
            const {
                auth,
                ...passThroughProps
            } = this.props;
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
            const handleDrop = this
                .handleDrop
                .bind(this);
            // const handleSubmit = this.handleSubmit.bind(this); Pass props to wrapped
            // component
            return (
                <WrappedComponent
                    handleDrop={handleDrop}
                    status={this.state.status}
                    {...passThroughState}
                    {...passThroughProps}></WrappedComponent>
            )

        }
    })
}

var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

class XumiDropperView extends Component {

    constructor(props) {/* strips props from the container which will be used to handle events */
        super(props)
        this.state = {}
    }
    render() {

        const {
            handleDrop,
            handleSubmit,
            progress,
            dataset_name,
            status,
            base_file,
            feat_file,
            segment_base_file,
            segment_feat_file,
            ...passedProps
        } = this.props;

        console.log(this.state)
        return (
            <StyledUploadForm
                {...passedProps}
                className={(isAdvancedUpload
                ? 'has-advanced-upload'
                : "") + " box " + (this.state.dragging
                ? " is-dragover "
                : "")}
                onDragEnter={(e)=>{if (!this.state.dragging){this.setState({"dragging": true})}}}
                onDragLeave={(e)=>{if (this.state.dragging){this.setState({"dragging": false})}}}
                onDragOver={(e) => {if (this.state.dragging){this.setState({"dragging": false})}}}

                >

                <div className="status">status: {status}</div>
                <div>progress: {status}</div>
                <div>dataset_name: {dataset_name}</div>
                <div>base_file: {base_file
                        ? base_file.name
                        : "no base file selected"}</div>
                <div>feat_file: {feat_file
                        ? feat_file.name
                        : "no feature file selected"}</div>
                <div>segmentation_base_file: {segment_base_file
                        ? segment_base_file.name
                        : "no segmentation base file selected"}</div>
                <div>segmentation_feat_file: {segment_feat_file
                        ? segment_feat_file.name
                        : "no segmentation feature file selected"}</div>

                <label htmlFor="file" className="fillsarea" onDragOver={onDragOver} onDrop={handleDrop}>This is the label for the files
                <input type="file" name="file" id="file" style={{display:"none"}}/>
                </label>

                <div className="box__uploading">Uploading&hellip;</div>
                <div className="box__success">Done!</div>
                <div className="box__error">Error!
                    <span></span>.</div>

            </StyledUploadForm>
        )
    }
}

const StyledUploadForm = styled.form `
.dropzone{
    background-color:red;
    height:200px;
    width:200px;
    opacity:.3;
    cursor:pointer;
    position:absolute;
}
.fillsarea{
    position:absolute;
    left:0px;
    right:0px;
    top:0px;
    bottom:0px;
}
font-size: 1.25rem;
background-color: #c8dadf;
position: relative;
padding: 100px 20px;

color:darkgray;
.text-status{
    position:absolute;
    opacity:.25;
    z-index:-1;
}
&.has-advanced-upload {
    background-color: white;
    outline: 2px dashed black;
    outline-offset: -10px;
  }
&.has-advanced-upload .box__dragndrop {
    display: inline;
  }


&.is-dragover {
    background-color: grey;
  }

.status{color : red;}
.box__dragndrop,
.box__uploading,
.box__success,
.box__error {
  display: none;
}
`

let XumiDropperContainer = withXumiUpload(XumiDropperView);
export default XumiDropperContainer
