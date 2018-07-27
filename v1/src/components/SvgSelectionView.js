import React, { Component } from 'react';
import styled, { css } from 'styled-components';

export default class SvgSelectionView extends Component{

    render(){
	return (
	    <SvgElement viewBox={""+this.props.x0+" "+this.props.y0+" "
				 +(this.props.x1-this.props.x0)+" "+
			(this.props.y1-this.props.y0)}>
	      {this.props.umis.map((umi, i)=>{
                  return <circle key={ i }
				     cx={umi.x}
				     cy={umi.y}
				     r={umi.appearance.size/5}
				     fill={"rgba("+umi.appearance.color+")"}
				     onClick={this.props.clickFun}
				     />;
                  })}</SvgElement>
	);
    }
}

const SvgElement=styled.svg`
width:100%;
height:100%;
position:absolute;
left:0px;
pointer-events:none;
circle{
pointer-events:auto;
cursor:pointer;
}
`;
