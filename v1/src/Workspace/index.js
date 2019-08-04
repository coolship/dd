
import {fetchDatasets} from '../actions';
import {userIdFromEmail} from "../actions/FileIO";
import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import DatasetWorkspaceContainer from "./DatasetWorkspace"
import {connect} from "react-redux";


// High level workspace component is responsible for dataset Selection
// logic and routing to handle anonymous user login.
class WorkspaceContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {}
        this
            .props
            .fetchDatasets(userIdFromEmail(this.props.auth.email))
    }
    render() {
        if (Object.keys(this.props.datasets).length > 0) {
            return (
                <Switch>
                    <Route
                        title="List"
                        exact
                        path='/workspace'
                        render={(props) => <EmptyWorkspaceView {...props} datasets={this.props.datasets}/>}/>
                    <Route
                        path='/workspace/:number'
                        render={(props) => <DatasetWorkspaceContainer
                        {...props}
                        {...this.props}
                        which_dataset={props.match.params.number}
                        datasets={this.props.datasets}/>}/>
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
                    transform: "translate(-50%, -50%)"
                }}>
                    Loading dataset, hang tight!
                </div>
            )
        }
    }
}

const EmptyWorkspaceView = (props) => {
    return (
        <div
            style={{
            top: "50%",
            left: "50",
            position: "absolute",
            backgroundColor: "red",
            transform: "translate(-50%, -50%)"
        }}>
            THIS IS AN EMPTY VIEW
        </div>
    )
}




const mapStateToProps = ({datasets, auth}) => {
    return {datasets, auth};
};

export default connect(mapStateToProps, {userIdFromEmail, fetchDatasets})(WorkspaceContainer);
