import React, { Component } from 'react';
import { connect } from "react-redux";
import { uploadPreviewAction } from "../actions/FileIO";


//withUploadPreview allows file uploads for a metadata object
//the function of this higher order ocmponent is to know
//where a metadata object is stored in firebase

export function withUploadMetadataPreview(WrappedComponent){
    return connect(({auth})=>{return {auth};}, { uploadPreviewAction })(
	class extends Component {

	    handleUploadPreview(metadata,blob){
		
	    }
	    
	    render(){
		// Filter out extra props that are specific to this HOC and shouldn't be
		// passed through
		const {auth, ...passThroughProps } = this.props;
		
		// Pass props to wrapped component
		return (
		    <WrappedComponent
		       handleUploadPreview={ this.handleUploadPreview.bind(this) }
		       {...passThroughProps}
		       />
		);
	    }
	    
	}
    );
}
	
