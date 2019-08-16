import _ from "lodash";
import React, {Component} from "react";
import {Dataset} from "../data/Dataset"
import {connect} from "react-redux";
import {fetchDatasets} from '../actions';

export default function withLoadedDataset(WrappedComponent) {
    return connect(({auth, datasets}) => {
        return {auth, datasets}
    }, {fetchDatasets})(class extends Component {
        constructor(props) {
            super(props);
            //this.props.fetchDatasets(userIdFromEmail(this.props.auth.email))
            this.state = {
                progress: 0,
                dataset_fetched_name: null
            };
            console.log("fetching datasets as HOC")
        }
        fetchDataset(resolve) {
            let metadata = _.find(this.props.datasets, (d) => d.dataset == this.props.which_dataset)
            var that = this;
            var url = metadata.downloadUrl;
            that.setState({loading_progress: 5, loading_status: "fetching dataset from server"});
            fetch(url).then(function (response) {
                return response.json();
            })
                .then(function (myJson) {
                    const coords_data = myJson;
                    that.setState({
                        loading_progress: 20,
                        loading_status: "creating microscope view",
                        dataset: new Dataset(
                            metadata.dataset, 
                            coords_data, 
                            metadata.annotations_url,
                            metadata.umi_ids_url, 
                            metadata)
                    });
                    resolve();

                })
                .catch((err) => {
                    throw err;
                });
        };

        resetDataset() {
            const that = this;
            that.resetting = true;
            this.setState({"dataset_fetched_name": null, dataset: null});
            var p = new Promise(resolve => {
                that.fetchDataset(resolve);
            })
                .then(function (result) {
                    return new Promise(resolve => {

                        if (!that.state.dataset) {
                            return
                        }
                        that
                            .state
                            .dataset
                            .initializeAsync((loading_progress, loading_status) => {
                                that.setState({
                                    loading_progress: loading_progress * .5 + 20,
                                    loading_status:loading_status,
                                });
                            }, () => {
                                that.setState({dataset_fetched_name: that.props.which_dataset, loading_progress: 100, loading_status: "complete"});
                                if (that.props.onReadyHandler) {
                                    that
                                        .props
                                        .onReadyHandler();
                                }
                                resolve();
                            },);
                    });

                })
                .then(function () {
                    that.resetting = false;
                });
        }
        componentDidMount(){this.resetIfNecessary()}
        componentDidUpdate(){this.resetIfNecessary()}
        resetIfNecessary(){
            if (this.props.which_dataset != this.state.dataset_fetched_name) {
                if (!this.resetting) {
                    this.resetDataset();
                }
            }
        }

        setWhichDataset(){
            this.props.which_dataset
        }

        render() {
            // Filter out extra props that are specific to this HOC and shouldn't be passed
            // through
            const {
                ...passThroughProps
            } = this.props;

            let passThroughState = {
                loading_progress: this.state.loading_progress,
                loading_state: this.state.loading_state,
                dataset_fetched_name: this.state.dataset_fetched_name,
                loaded_dataset:this.state.dataset          
            };

            // Inject props into the wrapped component. These are usually state values or
            // instance methods. const setActiveSlice = this    .setActiveSlice .bind(this);
            // const handleSubmit = this.handleSubmit.bind(this); Pass props to wrapped
            // componentconsole
            return (
                <WrappedComponent
                    test_prop={"hi"}
                    test_prop2={"hi2"}
                    {...passThroughState}
                    {...passThroughProps}></WrappedComponent>
            )

        }

    })

}
