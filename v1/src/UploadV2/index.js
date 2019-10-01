import React, { Component } from "react";
import { connect } from "react-redux";

import styled, { css } from "styled-components";
import { Breadcrumb } from "react-breadcrumbs";

import ProgressContainer from "../display/ProgressContainer";

import { fetchDatasets } from "../actions";
import { userIdFromEmail, deleteXumiDataset } from "../actions/FileIO";
import _ from "lodash";
import { Route, Switch } from "react-router-dom";
import XumiDropperContainer from "./XumiUploads";

import Close from "react-icons/lib/md/close";

import { NavLink } from "react-router-dom";
import PageView from "react-icons/lib/md/pageview";
import Edit from "react-icons/lib/md/edit";
import ProgressRing from "../widgets/ProgressRing"

function loadingMessage(dataset) {
  const inprogress = _.pickBy(
    dataset.server_job_statuses,
    (v, k) => v == "RUNNING"
  );
  console.log(inprogress);
  if (inprogress) {
    return Object.keys(inprogress)[0];
  } else {
    return "PROCESSING";
  }
}
function isComplete(dataset) {
  console.log(dataset.server_process_status);
  if (dataset.server_process_status != "COMPLETE") {
    return false;
  } else {
    return true;
  }
}

function totalProgress(dataset) {

  if(!dataset.server_job_statuses){
    return 5
  }

  let val= (
    (10 +
      90 *
        _.sum(
          _.map(dataset.server_job_statuses, (status, k) =>
            status == "COMPLETE" ? 1 : 0
          )
        )) /
    _.reduce(
      dataset.server_job_statuses,
      (k, cur) => {
        return k + 1;
      },
      0
    )
  );
  if (!val){return 0} else{return val}
}

class InProgressDatasetitem extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const props = this.props;

    return (
      <StyledInProgressDatasetItem
        className={"dataset-item item-" + props.dataset + " " + props.className}
      >
        <ProgressRing
          radius={60}
          stroke={10}
          progress={totalProgress(this.props.dataset_meta)}
        />
        <p className="title">{props.dataset_meta.display_name}</p>
        <p>Status: Computing Backend Server Transformation and Alignments</p>
        <p className="message themed">
          {loadingMessage(this.props.dataset_meta)}{" "}
        </p>
      <NavLink to={`/edit/${props.dataset}`} className="themed" ><span><Edit/>Configure</span></NavLink>
      </StyledInProgressDatasetItem>
    );
  }
}

const CompleteDatasetItem = props => (
  <StyledCompleteDatasetItem
    className={"dataset-item item-" + props.dataset + " " + props.className}
    
  >
    <div class="bg-image" style={{backgroundImage:`url(${process.env.REACT_APP_API_URL}/dataset/${props.dataset}/preview2k)`}}/>

    <Close
      onClick={() => {
        let r = window.confirm(
          "Really delete dataset" + props.dataset_meta.display_name + "?"
        );
        if (r == true) {
          props.deleteXumiDataset(props.dataset_key);
        }
      }}
      style={{ width:"36px",height:"36px", position: "absolute", right: "0px", top: "0px" }}
    />
    <p className="title">{props.dataset_meta.display_name}</p>
    <p>Status: ready</p>
    <NavLink to={"/workspace/" + props.dataset}><span className="themed"><PageView/>View this Dataset</span></NavLink>
    <NavLink to={`/edit/${props.dataset}`} className="themed" ><span><Edit/>Configure</span></NavLink>
  </StyledCompleteDatasetItem>
);

let stylecolor;
stylecolor="goldenrod"
const StyledInProgressDatasetItem = styled.div`
svg{

    margin-left: auto;
    margin-right: auto;
    fill:${stylecolor}
}
  border-color: ${stylecolor} !important;
  .themed{
      color:${stylecolor};
      &a:color:${stylecolor};
  }
`;

stylecolor="lightgreen"
const StyledCompleteDatasetItem = styled.div`
svg{
        margin-left: auto;
    margin-right: auto;
    fill:${stylecolor}
}

&:hover{
  .bg-image{
    filter: opacity(1);

  }
}
.bg-image{
  position:absolute;
  left:0px;
  top:0px;
  bottom:0px;
  right:0px;


  z-index: -1;
    background-position: center top;
    background-size: 50%;
    filter: brightness(2) grayscale(.5) opacity(0.25);

  background-repeat: no-repeat;

}
  border-color: ${stylecolor} !important;
  .themed{
    color:${stylecolor};
    &a:color:${stylecolor};
}
`;

const StyledUploadListContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  .item {
    margin: 20px;
    width: 250px;
    height: 250px;
    border-width: 2px;
    border-style: solid;
    border-radius: 3px;
    padding: 10px;
    position: relative;

    text-alignment: center;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    text-align: center;

    p {
      margin-top: 0px;
      margin-bottom: 5px;
      &.title {
        margin-bottom: 15px;
      }
    }
  }
`;

class SimpleUploadView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  uploadCompleteHandler(dataset_key, dataset_name, dataset_display_name) {
    this.setState({ upload_complete: true });
    window.setTimeout(() => this.setState({ upload_complete: false }), 500);
  }
  render() {
    let props = this.props;
    return (
      <div>
        <section>
          <div
            style={{
              maxWidth: "200px",
              margin: "50px",
              marginTop:"10vh",
              position: "relative",
    marginLeft: "auto",
    marginRight: "auto",
            }}
          >
            <h2>Welcome back!</h2>
            <p>
              You're logged in as user {this.props.auth.email}. Manage and
              upload datasets
            </p>
            <br/>
            <h2>Your Datasets</h2>
            <p>Previously uploaded data sets.</p>
          </div>


          <StyledUploadListContainer>
            {!this.state.upload_complete ? (
              <XumiDropperContainer
                className="item"
                handleUploadComplete={this.uploadCompleteHandler.bind(this)}
              />
            ) : null}

            {_.map(
              _.fromPairs(
                _.compact(
                  _.map(this.props.datasets, (d, k) => {
                    return !isComplete(d) ? [k, d] : undefined;
                  })
                )
              ),
              (d, k) => (
                <InProgressDatasetitem
                  key={d.dataset}
                  dataset={d.dataset}
                  dataset_key={k}
                  deleteXumiDataset={this.props.deleteXumiDataset}
                  dataset_meta={d}
                  className="item"
                />
              )
            )}

            {_.map(
              _.fromPairs(
                _.compact(
                  _.map(this.props.datasets, (d, k) => {
                    return isComplete(d) ? [k, d] : undefined;
                  })
                )
              ),
              (d, k) => (
                <CompleteDatasetItem
                  key={d.dataset}
                  dataset={d.dataset}
                  dataset_key={k}
                  deleteXumiDataset={this.props.deleteXumiDataset}
                  dataset_meta={d}
                  className="item"
                />
              )
            )}
          </StyledUploadListContainer>
        </section>
      </div>
    );
  }
}


class UploadProgressView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      which_dataset: props.match.params.number,
      metadata: _.find(
        props.datasets,
        d => d.dataset == props.match.params.number
      )
    };
    console.log(this.state);
  }
  render() {
    console.log(this.props);
    let props = this.props;
    return (
      <div>
        <Breadcrumb
          data={{
            title: <b>Sample Dataset {props.match.params.number}</b>,
            pathname: props.match.url,
            search: null
          }}
        />
        <div>
          <section>
            <b>Uploading Dataset {props.match.params.number}</b>
          </section>
        </div>
      </div>
    );
  }
}

class UploadV2View extends Component {
  constructor(props) {
    super(props);
    this.props.fetchDatasets(userIdFromEmail(this.props.auth.email));
    this.props.datasets;
  }
  render() {
    console.log("RERENDINGER BIG");
    return (
      <Switch>
        <Route
          title="List"
          exact
          path="/upload2"
          render={props => <SimpleUploadView {...this.props} />}
        />
        <Route
          path="/upload2/:number"
          render={props => (
            <UploadProgressView {...props} datasets={this.props.datasets} />
          )}
        />
      </Switch>
    );
  }
}
const mapStateToProps = ({ auth, datasets }) => {
  return { auth, datasets };
};
export default connect(
  mapStateToProps,
  { fetchDatasets, deleteXumiDataset }
)(UploadV2View);
