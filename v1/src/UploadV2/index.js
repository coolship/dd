import React, {Component} from 'react';
import {connect} from "react-redux";

import styled, {css} from 'styled-components';
import {Breadcrumb} from 'react-breadcrumbs';
import {NavLink} from "react-router-dom";
import ProgressContainer from "../display/ProgressContainer";

import {fetchDatasets} from '../actions';
import {userIdFromEmail, deleteXumiDataset} from "../actions/FileIO";
import _ from "lodash";
import { Route, Switch} from "react-router-dom";
import XumiDropperContainer from "./XumiUploads"


function loadingMessage(dataset) {
    const inprogress = _.pickBy(dataset.server_job_statuses, (v, k) => v == "RUNNING")
    console.log(inprogress)
    if (inprogress) {
        return Object.keys(inprogress)[0];
    } else {
        return "PROCESSING"
    }
}
function isComplete(dataset) {
    console.log(dataset.server_process_status)
    if (dataset.server_process_status!="COMPLETE"){return false;}
    else{return true }
}

function totalProgress(dataset) {

    return (100 * (_.sum(_.map(dataset.server_job_statuses, (status, k) => status == "COMPLETE"
        ? 1
        : 0))) / _.reduce(dataset.server_job_statuses, (k, cur) => {
        return k + 1
    }, 0));
}

class InProgressDatasetitem extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const props = this.props
        return (

            <StyledInProgressDatasetItem className={"dataset-item item-" + props.dataset}>

                <ProgressContainer progress={totalProgress(this.props.meta)}>
                    <span className="fill"></span>
                    <div className="message">{loadingMessage(this.props.meta)}</div>
                </ProgressContainer>

                <div>Pre-processing alignment and annotation data for {props.dataset}.</div>
            </StyledInProgressDatasetItem>

        );
    }
}

const CompleteDatasetItem = (props) => (
    <StyledCompleteDatasetItem className={"dataset-item item-" + props.dataset}>

        <button
            onClick={() => {
            props.deleteXumiDataset(props.dataset_key)
        }}>DELETE</button>
        <NavLink to={"/app/" + props.dataset}>
            <div className="preview-content">
                <h3>{props.dataset}</h3>
            </div>
        </NavLink>
        <div>View {props.dataset}
            in the DNA Microscope</div>

    </StyledCompleteDatasetItem>

);

const StyledInProgressDatasetItem = styled.div `
width:300px;
height:auto;
color:yellow;
margin-bottom:0px;
border:2px solid yellow;
border-radius : 3px;
padding:10px;
`
const StyledCompleteDatasetItem = styled.div `
width:300px;
height:auto;
color:green;
margin-bottom:0px;
border:2px solid green;
border-radius : 3px;
padding:10px;

`

const StyledUploadListContainer = styled.div `
  /* We first create a flex layout context */
  display: flex;
  
  /* Then we define the flow direction 
     and if we allow the items to wrap 
   * Remember this is the same as:
   * flex-direction: row;
   * flex-wrap: wrap;
   */
  flex-flow: row wrap;
  
  /* Then we define how is distributed the remaining space */
  justify-content: space-around;

`

class SimpleUploadView extends Component {

    render() {
        let props = this.props
        return (
            <div>
                <section>
                    <h1>upload datasets</h1>
                    <XumiDropperContainer/>
                </section>

                <section>
                    <StyledUploadListContainer>
                        {_.map(_.fromPairs(_.compact(_.map(this.props.datasets, (d, k) => {
                            return !isComplete(d)
                                ? [k, d]
                                : undefined
                        }))), (d, k) =>< InProgressDatasetitem key = {
                            d.dataset
                        }
                        dataset = {
                            d.dataset
                        }
                        dataset_key = {
                            k
                        }
                        deleteXumiDataset = {
                            this.props.deleteXumiDataset
                        }
                        meta = {
                            d
                        } />)}

                        {_.map(_.fromPairs(_.compact(_.map(this.props.datasets, (d, k) => {
                            return isComplete(d)
                                ? [k, d]
                                : undefined
                        }))), (d, k) =>< CompleteDatasetItem key = {
                            d.dataset
                        }
                        dataset = {
                            d.dataset
                        }
                        dataset_key = {
                            k
                        }
                        deleteXumiDataset = {
                            this.props.deleteXumiDataset
                        }
                        meta = {
                            d
                        } />)}
                    </StyledUploadListContainer>

                </section>
            </div>
        )
    }
}

class UploadProgressView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            which_dataset: props.match.params.number,
            metadata: _.find(props.datasets, (d) => d.dataset == props.match.params.number)
        }
        console.log(this.state)
    }
    render() {
        console.log(this.props)
        let props = this.props
        return (
            <div>
                <Breadcrumb
                    data={{
                    title: <b>Sample Dataset {props.match.params.number}</b>,
                    pathname: props.match.url,
                    search: null
                }}></Breadcrumb>
                < div >
                    <section>
                        <b>Uploading Dataset {props.match.params.number}</b>
                    </section>
                </div>
            </div>
        )
    }
}

class UploadV2View extends Component {
    constructor(props) {
        super(props)
        this
            .props
            .fetchDatasets(userIdFromEmail(this.props.auth.email));
        this.props.datasets
    }
    render(props) {
        console.log("RERENDINGER BIG")
        return (

            <Switch>
                <Route
                    title="List"
                    exact
                    path='/upload2'
                    render={(props) => <SimpleUploadView
                    {...props}
                    deleteXumiDataset={this.props.deleteXumiDataset}
                    datasets={this.props.datasets}/>}/>
                <Route
                    path='/upload2/:number'
                    render={(props) => <UploadProgressView {...props} datasets={this.props.datasets}/>}/>
            </Switch>

        );
    };
}

const mapStateToProps = ({auth, datasets}) => {
    return {auth, datasets};
};
export default connect(mapStateToProps, {fetchDatasets, deleteXumiDataset})(UploadV2View)