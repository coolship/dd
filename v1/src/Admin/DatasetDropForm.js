import React, { Component } from 'react';
import styled, { css } from 'styled-components';

export default function(props){
    /* strips props from the container which will be used to handle events */

    const {handleDrop,progress,dataset_name,status,coords_file,annotations_file,
	   ...passedProps} = props;
    return (
	<StyledUploadForm 
 {...passedProps}>
	  <div className="status">status: {status}</div>
	  <div>progress: {status}</div>
	  <div>dataset_name: {dataset_name}</div>
	  <div>coords_file: {coords_file?coords_file.name:"no coords file selected"}</div>
	  <div>annotations_file: {annotations_file?annotations_file.name:"no annotations file selected"}</div>
	  <input type="file"
		 name="file"
		 id="file"
		 onDrop={handleDrop}
		 />
	</StyledUploadForm>
    );
}

const  StyledUploadForm = styled.form`
.status{color:red;}
`;
