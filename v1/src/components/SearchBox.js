import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { setSelectionTime } from "../actions";
import Search from "react-icons/lib/md/search";
import WrapDropup from "./DropupContainer";
import _ from "lodash";

/**
 *
 * Early implementation of a datset searh box which makes
 * queries to the independently hostd. This backend server
 * sends back pre-compiled slices of the dataset, in a Float32
 * buffer which are directly loaded into the visual frontend.
 *
 * [TODO] implement query size limits, and better query handling, etc
 * so that useful data is paged and returned.
 */
class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: "umigeneids",
      querystring: "",
      queries: [""]
    };

    this.option_names = {
      umigeneids: "Query UMIs by Gene ID",
      sequences: "Query UMIs by Sequence",
      cellgoterms: "Query by GO Terms"
    };
    this.option_placeholders = {
      umigeneids: "Gene ID",
      sequences: "Sequence",
      cellgoterms: "GO Term"
    };
  }
  handleInput(e) {
    var urls = {
      umigeneids: "/queries/umis/geneids/",
      sequences: "/queries/umis/sequence/",
      cellgoterms: "/queries/cells/goterms/"
    };

    //this.tgt = e.target;
    let val = e.target.value;
    let queries = val.split(",");

    this.setState({ queries: queries, querystring: val });

    //let val = e.target.value;
    this.setState({ search_value: val });
    let which = this.props.which_dataset;

    if (val.length < 2) {
      this.props.setActiveSlice(null);
      return;
    }

    fetch(
      "http://35.237.243.111:5000" +
        urls[this.state.selectedOption] +
        which +
        "/" +
        val.replace(/[,]/g,':').replace(" ", "")
    )
      .then(function(response) {
        return response.json();
      })

      .then(myJson => {
        let idx = -1;
        console.log(myJson)

        _.map(myJson, (d, k) => {
          idx += 1;
          console.log(d);
          console.log(idx,k)
          this.props.setActiveSlice(d, idx, k);
        });
        this.props.setSelectionTime(Date.now());
      });
  }

  // returns left and right controls containing FOV / camera manipulation and
  // dataset manipulation controls respectively
  render() {
    return WrapDropup(
      <StyledSearchBox>
        <input
          className="search input"
          type="text"
          ref={search => {
            this.searchInput = search;
          }}
          onChange={this.handleInput.bind(this)}
          placeholder={this.option_placeholders[this.state.selectedOption]}
          contentEditable={true}
        />
        <div className="fancyinput">
          {_.map(this.state.queries, (q, i) => (
            <span
              key={i}
              style={{ color: i == 0 ? "blue" : i == "1" ? "green" : "red" }}
            >
              {i > 0 ? "," : ""}
              {q}
            </span>
          ))}
        </div>
        <Search />
        <ul className="options dropup-content">
          <form action="">
            {_.map(["umigeneids", "sequences", "cellgoterms"], nm => (
              <li
                key={nm}
                className={this.state.selectedOption === nm ? "selected" : ""}
              >
                <span className="checkmark" />
                <input
                  type="radio"
                  name="searchtype"
                  value={nm}
                  id={nm}
                  disabled={false}
                  checked={this.state.selectedOption === nm}
                  onChange={this.handleOptionChange}
                />
                <label htmlFor={nm}>{this.option_names[nm]}</label>
              </li>
            ))}
          </form>
        </ul>
      </StyledSearchBox>
    );
  }

  handleOptionChange = changeEvent => {
    this.setState({ selectedOption: changeEvent.target.value });
  };
}

export default connect(
  ({}) => {
    return {};
  },
  { setSelectionTime }
)(SearchBox);

const StyledSearchBox = styled.div`
  .placeholder {
    text-align: left;
    color: rgba(255, 255, 255, 0.3);
  }
  position: relative;
  width: 200px;

  .fancyinput {
    position: absolute;
    pointer-events: none;
    top: 0px;
    font-size: 0.9em;
    font-weight:bold;
  }
  .input.search {
    font-size:.95em;
    background: transparent;
    color: transparent;
    caret-color: white;
    border: none;
    width: 100%;
    margin-right: -20px;
    margin-left: 3px;
    outline: none;
    cursor: text;
  }

  ul.options {
    .checkmark:before {
      content: "✓";
    }

    form {
      input {
        visibility: hidden;
      }
      li:not(.selected) {
        .checkmark {
          visibility: hidden;
        }
      }
    }
  }
`;
