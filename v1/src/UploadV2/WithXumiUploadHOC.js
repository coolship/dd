import React, {Component} from 'react';
import {uploadXumi} from "../actions/FileIO";
import {connect} from "react-redux";

// 
export default function withXumiUpload(WrappedComponent) {

    return connect(({auth}) => {
        return {auth};
    }, {uploadXumi})(class extends Component {
        constructor(props) {
            super(props);
            this.state = {
                files: {},
                submit_state:"waiting",
                progresses:{},
                
            };
        }

        submitHandler(){
            this.submitDataset()
        }
        nameChangeHandler(e){
            this.setState({"dataset_display_name":e.target.value})
        }

        handleDrop(event) {
            event.preventDefault();

            const addFile = (file, name) => {
                this.setState({
                    files: Object.assign(this.state.files, {[name]: file})
                });
                if (this.isReady()) {
                    this.setState({submit_state:"has_files"})
                } else{
                    this.setState({submit_state:"has_bad_files"})
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
                        "dataset_display_name": "untitled",
                        "dataset_name": String(Math.random()).slice(2)
                    });

                    //starts an async read process to look through the folder system
                    r.readEntries((entries) => {
                        for (var i = 0; i < entries.length; i++) {
                            var item = entries[i];
                            if (item.name.includes("segment")) {
                                if (item.name.includes("feat")) {
                                    console.log("no longer reading segmentation feature file")
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
            return this.state.files.base_file && this.state.files.feat_file && this.state.files.segment_base_file
        }


        submitDataset() {
            var callbacks = {
                progress: (nm, progress) => {
                    let progresses = this.state.progresses
                    progresses[nm] = progress
                    const mean_progress = Object.entries(progresses).reduce((prev,cur,)=>prev+cur[1],0) / 4

                    this.setState({progress: mean_progress*100,
                    progresses:progresses});
                },
                complete: (key) => {
                    this.props.handleUploadComplete(key, this.state.dataset_name,this.state.dataset_display_name)
                    this.setState({progress:100,
                    submit_state:"uploaded"})
                }
            };

            console.log(this.state)
            console.log(this.state.dataset_display_name)
            //upload method using global redux store
            this
                .props
                .uploadXumi(this.state.files, {
                    dataset: this.state.dataset_name,
                    display_name: this.state.dataset_display_name,
                    email: this.props.auth.email,
                    key: null
                }, callbacks);
            this.setState({submit_state:"uploading",
        progress:0
        });
            //return false;

        }
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
                dataset_name: this.state.dataset_name,
                dataset_display_name: this.state.dataset_display_name

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
                    submit_state={this.state.submit_state}
                    progress={this.state.progress}
                    status={this.state.status}
                    dropped_files={this.state.files}
                    handleNameChange={this.nameChangeHandler.bind(this)}
                    handleSubmit={this.submitHandler.bind(this)}
                    {...passThroughState}
                    {...passThroughProps}></WrappedComponent>
            )

        }
    })
}