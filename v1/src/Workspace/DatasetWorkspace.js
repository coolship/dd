import React, {Component} from "react";
import DatasetWrangler from '../components/DatasetWrangler';
import withLoadedDataset from './withLoadedDataset'
import ProgressContainer from "../display/ProgressContainer";
import DatasetStageContainer from '../components/DatasetStageContainer';
import styled, {css} from 'styled-components';
import _ from "lodash";

// container object responsible for loading in a current dataset and providing
// props to the view area

class DatasetWorkspaceContainer extends Component{
    setActiveSlice(data){this.loaded_dataset.setUmiSlice(data);}
    render(){return < DatasetWorkspaceView setActiveSlice={this.setActiveSlice.bind(this)} {...this.props}/>}
}
export default withLoadedDataset(DatasetWorkspaceContainer)

// workspace view contains the actual viewable area
const DatasetWorkspaceView = (props) => {
    if (props.which_dataset != props.dataset_fetched_name) {
        return (
            <LoadingScreen>
                <h1>Loading Dataset, {props.which_dataset}</h1>
                <ProgressContainer progress={props.loading_progress}>
                    <span className="fill"></span>
                    <div className="message">{props.loading_status}</div>
                </ProgressContainer>
            </LoadingScreen>
        );
    } else {
        const inverted = {};
        _.each(props.datasets, (v, k) => {
            inverted[v["dataset"]] = k
        });
        const meta_key = inverted[props.which_dataset]
        const meta = props.datasets[meta_key];
        return (
            <div>
                <StageContainerArea>
                    <DatasetStageContainer
                        dataset={props.loaded_dataset}
                        metadata={meta}
                        metadata_key={meta_key}
                        is_demo={false}
                        appearance_props={{
                        no_buttons: props.no_buttons
                            ? true
                            : false
                    }}/>
                </StageContainerArea>
                <DatasetWrangler
                    which_dataset={props.which_dataset}
                    setActiveSlice={props.setActiveSlice}></DatasetWrangler>
            </div>
        )
    }
};

//STYLES
const StageContainerArea = styled.div `
position: absolute;
bottom: 0px;
right: 0px;
left: 0px;
top: 64px;
`
const LoadingScreen = styled.div `
left:50%;
top:50%;
position:absolute;
transform: translate(-50%, -50%);
`;
