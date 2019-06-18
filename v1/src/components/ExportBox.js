import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import WrapDropup from "./DropupContainer";
import _ from "lodash";

const StyledExportBox = styled.div`
  position: relative;
  a:link {
    color: white;
  }
`;

function exportToPlainText({text,filename}){
  let contentType = "text/plain;charset=utf-8;";
  var a = document.createElement("a");
  console.log(filename,text)
  a.download = filename;
  a.href = "data:" + contentType + "," + encodeURIComponent(text);
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

class ExportBox extends Component {
  constructor(props) {
    super(props);

    this.option_names = {
      datasetcsv: "Export dataset to CSV",
      datasetfasta: "Export dataset to Fasta",
      querycsv: "Export query to CSV",
      queryfasta: "Export query to Fasta"
    };

    console.log(this.props.which_dataset);
    this.option_urls = {
      datasetcsv: `http://35.237.243.111:5000/export/${
        this.props.which_dataset
      }/csv`,
      datasetfasta: `http://35.237.243.111:5000/export/${
        this.props.which_dataset
      }/fasta`,
      querycsv: `http://35.237.243.111:5000/export/${
        this.props.which_dataset
      }/query/csv`,
      queryfasta: `http://35.237.243.111:5000/export/${
        this.props.which_dataset
      }/query/fasta`
    };
  }
  downloadQuery(event) {
    var selected = this.props.getActiveSlice()
      ? this.props.getActiveSlice()
      : [0, 1, 2, 3, 4, 5, 6];

    var U = new URL(this.option_urls[event.target.getAttribute("option_name")]);
    U.search = new URLSearchParams({ umis: JSON.stringify(selected) });

    fetch(U)
      .then(function(response) {
        return response.json();
      })
      .then(myJson => {
        let { filename, text } = myJson;
        console.log(myJson)
        console.log(filename,text.slice(0,100))
        exportToPlainText({filename,text});
      });
    event.preventDefault();
    return false;
  }

  render() {
    return WrapDropup(
      <StyledExportBox>
        <div>Export to File</div>
        <ul className="dropup-content">
          {_.map(["datasetcsv", "datasetfasta"], nm => (
            <li key={nm}>
              <a href={this.option_urls[nm]} download>
                {this.option_names[nm]}
              </a>{" "}
            </li>
          ))}
          {_.map(["querycsv", "queryfasta"], nm => (
            <li key={nm}>
              <a
                href={this.option_urls[nm]}
                onClick={this.downloadQuery.bind(this)}
                option_name={nm}
                download
              >
                {this.option_names[nm]}
              </a>
            </li>
          ))}
        </ul>
      </StyledExportBox>
    );
  }
}
export default ExportBox;
