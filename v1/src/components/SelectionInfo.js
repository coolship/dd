import React, { Component } from 'react';
import { connect } from "react-redux";


class SelectionInfo extends Component{
    render(){
	if(this.props.selection.select_umi_idx > 0){
	    return (
		<div>
		  <p/>UMI SELECTED: {this.props.selection.select_umi_idx}
		  <p/>SELECTION MODE: {this.props.selection.select_type}
		  <p/>SEQUENCE: <input type="textarea" value={this.props.dataset.umis_json?
							      this.props.dataset.umis_json[this.props.selection.select_umi_idx].sequence:
				       ""}/>
		</div>
	    );
	} else {
	    return null;
	}
    }
}



function mapStateToProps({selection, dataset}){
    return {selection, dataset};
}

export default connect (mapStateToProps, {}) (SelectionInfo);
