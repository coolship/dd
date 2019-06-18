import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import WrapDropup from "./DropupContainer";
import _ from "lodash";

import TabUnselected from "react-icons/lib/md/tab-unselected";

import PanTool from "react-icons/lib/md/pan-tool";
const StyledInteractionSelectBox = styled.div`
  position: relative;
  a:link {
    color: white;
  }
  .option.icon{
      color:white;
  }
  .icon-padright{
        padding-right:15px;
  }
  
  .selected .option.icon{
      color:blue;
  }
  .selected{
    color:blue;
  }
  input{
    visibility:hidden;
  }
`;

class InteractionSelectBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: "rectangle"
    };

    this.options = {
      panzoom: {
        name: "Pan & Zoom",
        icon: <PanTool className="icon option icon-padright"/>
      },
      rectangle: {
        name: "Rectangle Select",
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
      <StyledInteractionSelectBox>
        {this.options[this.state.selectedOption].icon}<span>Interaction Mode</span>
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
      </StyledInteractionSelectBox>
    );
  }
}
export default InteractionSelectBox;
