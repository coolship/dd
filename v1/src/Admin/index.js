import React, { Component } from 'react';
import DatasetDropForm from "./DatasetDropForm";
import withDatasetFolderUpload from "./withDatasetFolderUpload";

/* HOC withDatasetFolderUpload interacts with redux to handle auth*/
let DatasetDrop = withDatasetFolderUpload(DatasetDropForm);

const Admin = (props) => {

    
    return (
	<div>
	  <h1>/admin</h1>
	  <section><h1>upload sample datasets</h1>
	    <DatasetDrop/>
	  </section>
	  <section><h1>manage sample datasets</h1>
	  </section>
	</div>
	   );
};


export default Admin;
