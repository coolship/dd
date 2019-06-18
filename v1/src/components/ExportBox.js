import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import WrapDropup from "./DropupContainer";
import _ from "lodash"

const StyledExportBox = styled.div`
position:relative;
a:link{
    color:white;
}
`;

class ExportBox extends Component{
  constructor(props) {
    super(props);

    this.option_names = {
      datasetcsv: "Export dataset to CSV",
      datasetfasta: "Export dataset to Fasta",
      querycsv: "Export query to CSV",
      queryfasta: "Export query to Fasta"
    };

    this.option_urls = {
      datasetcsv: "http://35.237.243.111:5000/export/5838205499823053/csv",
      datasetfasta: "http://35.237.243.111:5000/export/5838205499823053/fasta",
      querycsv: "http://35.237.243.111:5000/export/5838205499823053/csv",
      queryfasta: "http://35.237.243.111:5000/export/5838205499823053/fasta"
    };
  }
  render() {
    return WrapDropup(
      <StyledExportBox>
        <div>Export to File</div>
        <ul className="dropup-content">
          {_.map(
            ["datasetcsv", "datasetfasta", "querycsv", "queryfasta"],
            nm => (
              <li key={nm}>
                <a href={this.option_urls[nm]} download>
                  {this.option_names[nm]}
                </a>{" "}
              </li>
            )
          )}
        </ul>
      </StyledExportBox>
    );
  }
}
export default ExportBox;
