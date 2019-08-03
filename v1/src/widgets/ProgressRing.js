import React, { Component } from "react";



class ProgressRing extends React.Component {
  constructor(props) {
    super(props);
    const { radius, stroke } = this.props;
    this.normalizedRadius = radius - stroke * 2;
    this.circumference = this.normalizedRadius * 2 * Math.PI;
  }

  render() {

    const { radius, stroke, progress } = this.props;
    console.log(progress)
    const strokeDashoffset =
      this.circumference - (progress / 100) * this.circumference;
    return (
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="white"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={this.circumference + " " + this.circumference}
          style={{ strokeDashoffset }}
          strokeWidth={stroke}
          r={this.normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text x={radius } y={radius } className="small"
        dominantBaseline="middle" textAnchor="middle">
          {Math.round(progress)}%
        </text>
      </svg>
    );
  }
}

export default ProgressRing;