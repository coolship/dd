import React, { Component } from 'react';
import { connect } from "react-redux";
import DatasetDropForm from "./DatasetDropForm";
import withDatasetFolderUpload from "./withDatasetFolderUpload";
import _ from "lodash";
import {datasetToDemo, demoToDataset, datasetsToAll} from './fbDatasetServices'; 
import {fetchDatasets, fetchDemoDatasets} from '../actions';


/* HOC withDatasetFolderUpload interacts with redux to handle auth*/
let DatasetDrop = withDatasetFolderUpload(DatasetDropForm);

class Admin extends Component{
    constructor(props){
	super(props);
	this.props.fetchDatasets(this.props.auth.email);
	this.props.fetchDemoDatasets();  

    }
    render(props){
	return (
	    <div>
	      <section><h1>upload datasets</h1>
		<DatasetDrop/>
	      </section>
	      {this.props.auth.has_admin?
		  <section><h1>manage sample datasets</h1>

			<div><h3>unpublished datasets</h3>
			      {_.map(this.props.datasets,
				     (d,k)=>{return <div key={d.dataset}>{d.dataset}
					     <button onClick={()=>{
						   datasetToDemo(this.props.auth.email, k );
						   }}> publish demo</button></div>;
					    }
				    )}
			    </div>
			    <div><h3>published (demo) datasets</h3>
				  {_.map(this.props.demos,
					 (d,k)=>{return <div key={d.dataset}>{d.dataset}
						 <button onClick={()=>{
						       demoToDataset(this.props.auth.email, k );
						       }}> unpublish</button></div>;}
					)}
				</div>
		      </section>
		  :null}
	    </div>
	);
    };
}

const mapStateToProps = ({auth,datasets,demos})=>{return {auth,datasets,demos}; };
export default connect(mapStateToProps,{fetchDatasets,fetchDemoDatasets})(Admin);
