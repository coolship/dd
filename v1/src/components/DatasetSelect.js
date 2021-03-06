import React, { Component } from 'react';
import _ from "lodash";
import { connect } from "react-redux";
import { setCurrentDataset } from "../actions";
import styled, { css } from 'styled-components';



class DatasetSelect extends Component{
    constructor(props){
	super(props);
    }

    datasetSelected(event){
	const tgt = event.target;
	if(tgt.selectedIndex <= 0){
	    this.props.setCurrentDataset(undefined);
	};
	const sel  = tgt.options[tgt.selectedIndex];
	const name = sel.dataset.dataset_name;
	event.target.blur();
	this.props.setCurrentDataset(name);
    }

    render(){
	let list_els;
	var datasets = this.props.datasets;
	list_els = _.map(datasets,function(e, i){
	    return (
		<option
		   key={i}
		   data-dataset_name={e.dataset}
		   >
		  {e.dataset}
		</option>);
		});
		
	return(   
		<DatasetSelectStyled value={this.props.app.current_dataset?this.props.app.current_dataset:"none"} onChange={this.datasetSelected.bind(this)}>
		<option value="none" disabled>choose a dataset</option>
	        { list_els }
	    </DatasetSelectStyled>
	);
    }   
}

    function mapStateToProps( { datasets,app} ) {
	return { datasets,app };
}


export default connect(mapStateToProps, { setCurrentDataset } )(DatasetSelect); 

const DatasetSelectStyled=styled.select`
		width:225px;
		background-color: transparent;
    color: white;
    border-color: transparent;
`;
