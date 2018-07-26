import React, { Component } from 'react';

import FovControls from './FovControls';
import Welcome from "./Welcome";
import AnnotationControls from "./AnnotationControls";
import SelectionInfo from "./SelectionInfo";
import styled, { css } from 'styled-components';


export default class HeadsUp extends Component {

    render(){
	return(
		<HeadsUpStyled className="heads-up">
		<SelectionInfo/>
		<Welcome/>
		<AnnotationControls/>
		<FovControls/>
		</HeadsUpStyled>
	);
    }
}


const HeadsUpStyled = styled.div`
    position:fixed;
    bottom:0px;
    right:0px;
    margin-bottom:40px;
    margin-right:40px;
    width:400px;
    text-align:left;
    background-color:black;
    padding:20px;
`;
