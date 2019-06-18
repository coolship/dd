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
      selectedOption: "umigeneids"
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
  handleChange(e) {
    var urls = {
      umigeneids: "/queries/umis/geneids/",
      sequences: "/queries/umis/sequence/",
      cellgoterms: "/queries/cells/goterms/"
    };

    let val = e.target.value;
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
        val
    ).then(function(response) {
        return response.json();
      })
      .then(myJson => {
        this.props.setActiveSlice(myJson);
        this.props.setSelectionTime(Date.now());
      });
  }

  // returns left and right controls containing FOV / camera manipulation and
  // dataset manipulation controls respectively
  render() {
    return WrapDropup(
      <StyledSearchBox>
        <input
          className="search"
          type="text"
          ref={input => {
            this.searchInput = input;
          }}
          onChange={this.handleChange.bind(this)}
          placeholder={this.option_placeholders[this.state.selectedOption]}
        />
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
    if (this.searchInput) {
    }

    this.searchInput.select();
  };
}

export default connect(
  ({}) => {
    return {};
  },
  { setSelectionTime }
)(SearchBox);

const StyledSearchBox = styled.div`
  position: relative;
  width: 200px;
  input.search {
    background: transparent;
    color: white;
    caret-color: white;
    border: none;
    width: 100%;
    margin-right: -20px;
    outline: none;
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
