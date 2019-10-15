import React, {Component} from 'react';
import {uploadFull} from "../actions/FileIO";
import {connect} from "react-redux";
import _ from "lodash";

class FullUploadHOC extends Component {
    constructor(props) {

        
        console.log(React.version);
        super(props);
        console.log(this.props.which_dataset)
        if (!this.props.which_dataset){ throw  "no dataset specified in HOC!"}
        
        console.log(this.props.datasets)

        // console.log(_.pick(this.props.datasets,"dataset"))
        // console.log(_.invert(_.pick(this.props.datasets,"dataset")))
        const key =this.getKey()// _.invert(_.pick(this.props.datasets,"dataset"))[String(this.props.which_dataset)]
        const dataset =this.getDataset()
        console.log(key)
        if(!key){throw "no key!"}

        const has_files = "full_data" in dataset.allfiles  && "full_key" in dataset.allfiles && "full_params" in dataset.allfiles
        
        this.state = {
            files: {},
            submit_state:has_files?"uploaded":"waiting",
            progresses:{},
            dataset_key:key,
            dataset_meta:dataset,
        };
    }
    getDataset = ()=> this.props.datasets[this.getKey()]
    getKey(){return _.invert(_.mapValues(this.props.datasets,"dataset"))[this.props.which_dataset]}


    submitHandler(){
        this.submitDataset()
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

                //starts an async read process to look through the folder system
                r.readEntries((entries) => {
                    for (var i = 0; i < entries.length; i++) {
                        var item = entries[i];

                        console.log(item.name)
                        if (item.name.includes("seq_params_data")) {
                            item.file(file => addFile(file, "params_file"))
                        } else if (item.name.includes("data")) {
                            console.log("PARAMS")
                            item.file(file => addFile(file, "data_file"))
                        } else if (item.name.includes("key")) {
                            item.file(file => addFile(file, "key_file"))
                        } else {
                            console.log("skipping unrecognized file " + item.name);
                        }
                    }

                });
            }
        }
    }

    isReady() {
        return this.state.files.key_file && this.state.files.data_file && this.state.files.params_file
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
                if(this.props.handleUploadComplete){this.props.handleUploadComplete(key)}
                this.setState({progress:100,
                submit_state:"uploaded"})
            }
        };

        this
            .props
            .uploadFull(this.state.files, {
                email: this.props.auth.email,
                dataset_key: this.state.dataset_key,
                dataset:this.props.which_dataset,
            }, callbacks,this.state.dataset_key);
        this.setState({submit_state:"uploading",
    progress:0
    });
        //return false;

    }
    render() {
        // Filter out extra props that are specific to this HOC and shouldn't be passed
        // through
        const {auth,...passThroughProps} = this.props;
        let passThroughState = this.state;

        // Inject props into the wrapped component. These are usually state values or
        // instance methods.
        const handleDrop = this
            .handleDrop
            .bind(this);
        // const handleSubmit = this.handleSubmit.bind(this); Pass props to wrapped
        // component

        const WrappedComponent = this.props.WrappedComponent
        if (! WrappedComponent){throw ("no wrapped component!")}
        return (
            <WrappedComponent
                submit_state={this.state.submit_state}
                progress={this.state.progress}
                status={this.state.status}
                dropped_files={this.state.files}
                handleDrop={handleDrop}
                handleSubmit={this.submitHandler.bind(this)}

                data_file = {this.state.files.data_file}
                key_file = {this.state.files.key_file}
                params_file = {this.state.files.params_file}

                
                {...passThroughState}
                {...passThroughProps}></WrappedComponent>
        )

    }
}



// 
export default function withFullUploadHOC(WrappedComponent) {
    return connect(({auth, datasets}) => {
        return {auth, datasets, WrappedComponent}; // this injection may not work!
    }, {uploadFull})(FullUploadHOC)
}
