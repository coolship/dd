import React, { Component } from 'react';
import _ from "lodash";
import { connect } from "react-redux";
import { setCurrentDataset } from "../actions";


class DatasetSelect extends Component{
    constructor(props){
	super(props);
    }

    datasetSelected(event){
	const tgt = event.target;
	const sel  = tgt.options[tgt.selectedIndex];
	const name = sel.dataset.dataset_name;
	console.log("setting, ", name);
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
		<select className="set-slide" onChange={this.datasetSelected.bind(this)}>
		<option value="" selected disabled>choose a dataset</option>
	        { list_els }
	    </select>
	);
    }   
}

function mapStateToProps( { datasets} ) {
    return { datasets };
}


export default connect(mapStateToProps, { setCurrentDataset } )(DatasetSelect); 

