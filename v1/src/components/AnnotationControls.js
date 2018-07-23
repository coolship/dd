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

	if(this.props.app.current_dataset !=null){
	
	    const metadata = _.find(this.props.datasets,(d)=>d.dataset==this.props.app.current_dataset);

	    if(metadata.umis_url){
		UmiQuery =(
		    <div className="query-umi">
		      <label className="name">sequence query:
			<input onChange={this.onChangeUmiQuery.bind(this)} type="text" name="query"/>
		      </label>
		    </div>);
	    } else {UmiQuery = null; }
	    
	    Annotations = (<div className="annotation-controls">
			   <AddRemoveUmisButton which_dataset={this.props.app.current_dataset} />
			   <AddRemoveTypesButton which_dataset={this.props.app.current_dataset} />
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

function mapStateToProps({auth, datasets, query, app}){
    return { auth, datasets, query, app};
}

export default connect (mapStateToProps, {setQueryUmiSubstring, setQueryUmiType}) (AnnotationControls);
