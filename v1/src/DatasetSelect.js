import React, { Component } from 'react';
import ReactDOM from 'react-dom';





class DatasetSelect extends Component{
    constructor(props){
	super(props)	
    }

    render(){
	var that = this
	return(   
		<select className="set-slide" onChange={this.props.handleAppSlideIdChanged}>
		<option value="">choose a dataset</option>
	                    {this.props.names.map(function(e, i){
				return <option
				key={e}
				data-dataset_name={e.split(".").slice(0,-1).join(".")}
				data-dataset_fname={e}
				value={e.split(".").slice(0,-1).join(".")}>
				    {i}. {e}
				</option>
                  })}
	    </select>
	)
    }   
}

export default DatasetSelect
