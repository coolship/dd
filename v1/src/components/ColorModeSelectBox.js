import React, {Component} from "react";
import {connect} from "react-redux";
import styled from "styled-components";
import WrapDropup from "./DropupContainer";
import _ from "lodash";

import TabUnselected from "react-icons/lib/md/tab-unselected";
import Visibility from "react-icons/lib/md/visibility";
import WrapSelectBox from "./SelectBox";

class ColorModeSelectBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: "CELL"
        };

        this.options = {
            CELL: {
                name: "View: Cells",
                sel_name:"Cells",
                icon: < Visibility className = "icon option icon-padright" / >
            },
            DEFAULT: {
                name: "View: Transcripts",
                sel_name:"Tx Types",
                icon: < Visibility className = "icon option icon-padright" / >
            }
        };
    }

    handleOptionChange = changeEvent => {
        this.setState({selectedOption: changeEvent.target.value});
        this
            .props
            .handleSetColorMode(changeEvent.target.value)
    };

    render() {
        return WrapDropup(WrapSelectBox(
            <div>
                {this.options[this.state.selectedOption].icon}
                <span>{this.options[this.state.selectedOption].sel_name}</span>
                <ul className="dropup-content">
                    <form action="">
                        {_.map(Object.keys(this.options), nm => (
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
                                <label htmlFor={nm}>
                                    {this.options[nm].icon}
                                    {this.options[nm].name}
                                </label>
                            </li>
                        ))}
                    </form>
                </ul>
            </div>
        ));
    }
}
export default ColorModeSelectBox;
