import React, { Component } from 'react';

import FovControls from './FovControls';
import Welcome from "./Welcome";
import AnnotationControls from "./AnnotationControls";
import SelectionInfo from "./SelectionInfo";

export default class HeadsUpComponent extends Component {

    render(){
	return(
		<div className="heads-up">
		<SelectionInfo/>
		<Welcome/>
		<AnnotationControls/>
		<FovControls/>
		</div>
	);
    }
}
