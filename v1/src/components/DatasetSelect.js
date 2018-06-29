import React, { Component } from 'react';
import _ from "lodash";
import { connect } from "react-redux";
import { activateDataset } from "../actions/FileIO";





class DatasetSelect extends Component{
    constructor(props){
	super(props)	
    }


    datasetSelected(event){
	const tgt = event.target;
	const sel  = tgt.options[tgt.selectedIndex];
	const metadata =JSON.parse( sel.dataset.dataset_metadata)

	console.log("selecting!")
	console.log(metadata)
	this.props.activateDataset(metadata)
    }

    render(){
	let list_els;
	var datasets = this.props.datasets;


	list_els = _.map(datasets,function(e, i){
	    return <option
	    key={i}
	    data-dataset_name={e.dataset}
	    data-dataset_metadata={JSON.stringify(e)}
		>
		{e.dataset}
	    </option>
	})
	
	
	return(   
		<select className="set-slide" onChange={this.datasetSelected.bind(this)}>
		<option value="" selected disabled hidden>choose a dataset</option>
	        { list_els })}
	    </select>
	)
    }   
}

function mapStateToProps( { datasets} ) {
    return { datasets };
}


export default connect(mapStateToProps, { activateDataset } )(DatasetSelect) 

