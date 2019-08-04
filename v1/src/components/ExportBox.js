import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import WrapDropup from "./DropupContainer";
import ReactDOM from "react-dom";
import _ from "lodash";

import CloudDownload from "react-icons/lib/md/cloud-download";


const StyledExportBox = styled.div`
  position: relative;


/* visited link */
a:visited {
  color: white;
}

  a:link {
    color: white;
  }

.arrow{
  font-size: 60%;
  padding-left: 5px;
}
  &:hover{
    .show-collapsed{
      display:none
    }
  }
  &:not(:hover){
    .arrow{
      opacity:.5;
    }
    .show-expanded{
      display:none
    }
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


  exportPng() {
    const backend = this.props.backend_canvas_ref.current;
    const rcanvas = backend.getStorageCanvas();
    var export_canvas = ReactDOM.findDOMNode(this.props.export_canvas_ref.current);
    export_canvas.width = 2000;
    export_canvas.height = 2000;

    export_canvas
      .getContext("2d")
      .drawImage(rcanvas, 0, 0, export_canvas.height, export_canvas.width);

    var data = export_canvas.toDataURL("image/jpeg", 0.75);
    var link = document.createElement("a");
    link.download = "slide.jpg";
    link.href = data;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);             

  }

  render() {
    return WrapDropup(
      <StyledExportBox>
        <CloudDownload className="icon" />
        <span>Export<span className="show-collapsed arrow">▶</span><span className="show-expanded arrow">▲</span></span>
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

<li> <a onClick={this.exportPng.bind(this)}>Export .png</a></li>
          
        </ul>
      </StyledExportBox>
    );
  }
}
export default ExportBox;
