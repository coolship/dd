import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { connect } from "react-redux";
import _ from 'lodash';
import {AddRemoveUmisButton, AddRemoveTypesButton, DeleteDatasetButton} from "./DatasetButtons";

//COMPONENTS
import Close from 'react-icons/lib/md/close';

class DatasetListItem extends Component {
    render(){
	const meta = _.find(this.props.datasets,(d)=>d.dataset==this.props.which_dataset);
	return (
	    <DatasetCard className="dataset-item">
	      {this.props.which_dataset} 
	      <DeleteDatasetButton which_dataset={this.props.which_dataset}></DeleteDatasetButton>
	      <AddRemoveUmisButton which_dataset={this.props.which_dataset}/>
	      <AddRemoveTypesButton which_dataset={this.props.which_dataset}/>
	    </DatasetCard>);
    }
}

function mapStateToProps({datasets}){return {datasets};}
export default connect(mapStateToProps)(DatasetListItem); 

const DatasetCard =styled.div``;
