import React, { Component } from 'react';
import { connect } from "react-redux";
import { setQueryUmiSubstring, setQueryUmiType } from '../actions';
import DatasetSelect from './DatasetSelect';


import {AddRemoveUmisButton, AddRemoveTypesButton} from "./DatasetButtons";


import _ from 'lodash';


import Add from 'react-icons/lib/md/add';
import Close from 'react-icons/lib/md/close';


class AnnotationControls extends Component {
    onChangeUmiQuery(event){
	this.props.setQueryUmiSubstring(event.target.value);
    }
 
    render(){
	var Annotations, UmiQuery;
	
	if (this.props.dataset.current_dataset !=null){
	    if(this.props.dataset.umis_json){
		UmiQuery =(
		    <div className="query-umi">
		      <label className="name">sequence query:
			<input onChange={this.onChangeUmiQuery.bind(this)} type="text" name="query"/>
		      </label>
		    </div>);
	    } else {UmiQuery = null; }
	    
	}

	if(this.props.dataset.current_dataset != null){
	    Annotations = (<div className="annotation-controls">
			   <AddRemoveUmisButton which_dataset={this.props.dataset.current_dataset.name} />
			   <AddRemoveTypesButton which_dataset={this.props.dataset.current_dataset.name}/>
			   {UmiQuery}
			   </div>);
	} else {Annotations = null;}
	
	return (
	    <div className="app-controls">
	      <div className="dataset-controls">
		<DatasetSelect/>
		{Annotations}
	      </div>
	    </div>
	);
    }    
}

function mapStateToProps({dataset, auth, datasets, query}){
    return {dataset, auth, datasets, query};
}

export default connect (mapStateToProps, {setQueryUmiSubstring, setQueryUmiType}) (AnnotationControls);
