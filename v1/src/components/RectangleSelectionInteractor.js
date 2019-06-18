import React, { Component } from 'react';
import styled, { css } from 'styled-components';

export default class SvgSelectionView extends Component{

    render(){

	return (

	    <SvgElement viewBox={""+this.props.x0+" "+this.props.y0+" "
				 +(this.props.x1-this.props.x0)+" "+
			(this.props.y1-this.props.y0)}
                {...this.props}

                onMouseDown={this.props.mouseDown}
                onMouseUp={this.props.mouseUp}

            />
	);
    }
}

const SvgElement=styled.svg`
width:100%;
height:100%;
position:absolute;
left:0px;
`;
