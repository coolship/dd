import React, { Component } from 'react';
import styled, { css } from 'styled-components';




import convexHull from 'monotone-convex-hull-2d';

var points = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [0.5, 0.5]
]


export default class SvgSelectionView extends Component{

    render(){
	if(this.props.hull){
	    var hull_idxs = convexHull(this.props.umis.map((umi, i)=>{return [umi.x,umi.y];}));
	    var polycoords = hull_idxs.map(idx=>this.props.umis[idx].x+","+this.props.umis[idx].y).join(" ");
	}


	var window_data_w = (this.props.x1 - this.props.x0);
	var window_data_h = (this.props.y1 - this.props.y0);
	var scl = 1 / window_data_w;
	
	return (
	    <SvgElement viewBox={""+this.props.x0+" "+this.props.y0+" "
				 +(this.props.x1-this.props.x0)+" "+
			(this.props.y1-this.props.y0)}>
	      {this.props.umis.map((umi, i)=>{
                  return <circle key={ i }
				     cx={umi.x}
				     cy={umi.y}
				     r={umi.appearance.size*scl*.25}
				     fill={"rgba("+umi.appearance.color+")"}
				     onClick={this.props.clickFun}
				     />;
              })}
	      {this.props.hull?
		  <polygon points={polycoords}
			       strokeWidth={.25*scl}
			       fill="rgba(255, 255, 255, .3)" stroke="white" />
		  :null}
		</SvgElement>
	);
    }
}

const SvgElement=styled.svg`
width:100%;
height:100%;
position:absolute;
left:0px;
pointer-events:none;
`;
