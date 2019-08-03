import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import WrapDropup from "./DropupContainer";
import _ from "lodash";

import TabUnselected from "react-icons/lib/md/tab-unselected";
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
        icon: <PanTool className="icon option icon-padright"/>
      },
      RECTANGLE: {
        name: "Mouse: Select",
        icon: <TabUnselected className="icon option icon-padright"/>
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
        <div>
        {this.options[this.state.selectedOption].icon} <span>{this.options[this.state.selectedOption].name}</span>
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
        </div>
      )
    );
  }
}
export default InteractionSelectBox;
