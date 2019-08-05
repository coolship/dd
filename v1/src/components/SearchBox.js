import React, {Component} from "react";
import styled from "styled-components";
import Search from "react-icons/lib/md/search";
import WrapDropup from "./DropupContainer";
import _ from "lodash";
import JupyterLauncher from "./JupyterLauncher";



class SearchBox extends Component {
    constructor(props) {


        super(props);

        this.state = {
            selectedOption: "umigeneids",
        };

        this.option_names = {
            umigeneids: "Query UMIs by Gene ID",
            sequences: "Query UMIs by Sequence",
            cellgoterms: "Query by GO Terms"
        };
        this.option_placeholders = {
            umigeneids: "Gene ID",
            sequences: "Sequence",
            cellgoterms: "Cellular GO Term Enrichment"
        };
    }


    handleInput(e) {
        var urls = {
            umigeneids: "/queries/umis/geneids/",
            sequences: "/queries/umis/sequence/",
            cellgoterms: "/queries/cells/goterms/"
        };

        let val = e.target.value;
        e.target.value = ""
        this.setState({search_value: val});
        let which = this.props.which_dataset;
        const query_val = val
        const querystring = "http://35.237.243.111:5000" + urls[this.state.selectedOption] + which + "/" + query_val
            .replace(/[,]/g, ':')
            .replace(" ", "")

        const query_json_string = `${querystring}?format=${encodeURIComponent("json")}`
        const info = {
          query_json_string,
          query_val,
          query_type:this.state.selectedOption,
          query_description:this.option_placeholders[this.state.selectedOption],

        }
        this.props.runQuery(info)

    }
    _handleInputKeyDown = (e) => {
      if (e.key === 'Enter') {
        this.handleInput(e);
      }
    }
  
    // returns left and right controls containing FOV / camera manipulation and
    // dataset manipulation controls respectively
    render() {
        return WrapDropup(
            <StyledSearchBox   onMouseEnter={this.props.hoverOn} onMouseLeave={this.props.hoverOff}>
                <JupyterLauncher which_dataset={this.props.which_dataset} last_query={null}/>
                <input
                    className="search input"
                    type="text"
                    ref={search => {this.searchInput = search; }}
                    onKeyDown={this._handleInputKeyDown.bind(this)}
                    placeholder={this.option_placeholders[this.state.selectedOption]}
                    contentEditable={true}/>
                <Search/>
                <ul className="options dropup-content">
                    <form action="">
                        {_.map([
                            "umigeneids", "sequences", "cellgoterms"
                        ], nm => (
                            <li
                                key={nm}
                                className={this.state.selectedOption === nm
                                ? "selected"
                                : ""}>
                                <span className="checkmark"/>
                                <input
                                    type="radio"
                                    name="searchtype"
                                    value={nm}
                                    id={nm}
                                    disabled={false}
                                    checked={this.state.selectedOption === nm}
                                    onChange={this.handleOptionChange}/>
                                <label htmlFor={nm}>{this.option_names[nm]}</label>
                            </li>
                        ))}
                    </form>
                </ul>

            </StyledSearchBox>
        );
    }

    handleOptionChange = changeEvent => {
        this.setState({selectedOption: changeEvent.target.value});
    };
}



export default SearchBox

const StyledSearchBox = styled.div `
&:hover{
}
.logo-container.logo-container{



      position:absolute;
    left:0px; 
  transform:translate(-130%);
}
  .placeholder {
    text-align: left;
    color: rgba(255, 255, 255, 0.3);
  }

  position: relative;
  width: 200px;


  .input.search {
    color:inherit;
    padding-left:10px;
    font-size:.95em;
    background: transparent;
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
