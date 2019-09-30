import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import WrapDropup from "./DropupContainer";
import _ from "lodash";

import TabUnselected from "react-icons/lib/md/tab-unselected";
import Search from "react-icons/lib/md/search";
import Mouse from "react-icons/lib/md/mouse";
import PanTool from "react-icons/lib/md/pan-tool";
import WrapSelectBox from "./SelectBox";


class InteractionSelectBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: "PANZOOM"
    };

    this.options = {
      PANZOOM: {
        name: "Mouse: Camera controls",
        sel_name:"Camera",
        icon: <PanTool className="icon option"/>
      },
      RECTANGLE: {
        name: "Mouse: Select rectangle",
        sel_name:"Select",
        icon: <TabUnselected className="icon option"/>
      },
      CELL: {
        name: "Mouse: Select cell",
        sel_name:"Cell",
        icon: <Search className="icon option"/>
      }
    };
  }

  handleOptionChange = changeEvent => {
    this.setState({ selectedOption: changeEvent.target.value });
    this.props.handleSetInteractor(changeEvent.target.value)
  };

  render() {
    return WrapDropup(
      WrapSelectBox(
        <span>


        {<Mouse className="icon option"/>} <span>{this.options[this.state.selectedOption].sel_name}</span>
        <ul className="dropup-content">
          <form action="">
            {_.map(Object.keys(this.options), nm => (
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
                <label htmlFor={nm}>
                  {this.options[nm].icon}
                  {this.options[nm].name}
                </label>
              </li>
            ))}
          </form>
        </ul>
        </span>
      )
    );
  }
}
export default InteractionSelectBox;
