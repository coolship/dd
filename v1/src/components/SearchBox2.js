import React, {Component} from 'react';

import { connect } from "react-redux";
import styled from 'styled-components';
import {NavLink} from "react-router-dom";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
  } from 'styled-dropdown-component';
   

import Search from 'react-icons/lib/md/search';



import { Container } from 'styled-container-component';
import { Button } from 'styled-button-component';
import { Navbar, NavbarLink } from 'styled-navbar-component';
import { Nav } from 'styled-nav-component';
import NavRight from "../Nav3/NavRight";
 





export class SimpleDropdown extends React.Component {
    constructor(props) {
      super();
      this.state = {
        hidden: true,
      };
    }
   
    handleOpenCloseDropdown() {
    }
   
    render() {
      const { hidden } = this.state;
      return (
        <Dropdown>
          <Button
            secondary
            dropdownToggle
            onClick={() => this.handleOpenCloseDropdown()}
          >
            Dropdown Button
          </Button>
          <DropdownMenu hidden={hidden}>

          <DropdownItem><input type="radio" name="searchtype" value="umigeneids" id="geneids" disabled={false}       
            checked={this.state.selectedOption === "umigeneids"}
            onChange={this.handleOptionChange}
            /><label htmlFor="geneids">NCBI Gene Ids or Symbols</label></DropdownItem>
    <DropdownItem><input type="radio" name="searchtype" value="sequences" id="sequences"    disabled={false}      
            checked={this.state.selectedOption === "sequences"}
            onChange={this.handleOptionChange}
            /><label htmlFor="sequences">Sequence Matches</label></DropdownItem>
    <DropdownItem><input type="radio" name="searchtype" value="cellgoterms" id="cellgoterms"  disabled={false}       
            checked={this.state.selectedOption === "cellgoterms"}
            onChange={this.handleOptionChange}
            /><label htmlFor="cellgoterms">Segment Go Terms</label></DropdownItem>

 
          </DropdownMenu>
        </Dropdown>
      );
    }
  };




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
export default class SearchBox extends Component{
    constructor(props){
        super(props)
        this.state = {selectedOption:"umigeneids"}
    }
    handleChange(e) {
        var urls = {
            "umigeneids":"/queries/umis/geneids/",
            "sequences":"/queries/umis/sequence/",
            "cellgoterms":"/queries/cells/goterms/",
        };  

        let val = e.target.value
        this.setState({search_value:val})
        let which = this.props.which_dataset;
        


        if (val.length < 4){
            this.props.setActiveSlice(null)
            return
        }        

        fetch("http://35.237.243.111:5000"+urls[this.state.selectedOption]+which+"/"+val,) 
        .then(function(response) {return response.json();})
        .then((myJson)=>this.props.setActiveSlice(myJson));

    }


    //returns left and right controls containing FOV / camera manipulation
    //and dataset manipulation controls respectively
    render(){
	return <StyledSearchBox>
        <input type="search"
        onChange={this.handleChange.bind(this)}></input><Search className={"btn"}/>
            <div>  
            <SimpleDropdown/>
            </div>
        </StyledSearchBox>;
        }

    handleOptionChange = changeEvent => {
        this.setState({
        selectedOption: changeEvent.target.value
        });
    };
  
}


const StyledSearchBox=styled.div`
    position:relative;
    width: 200px;

    form{   
    li{
        display:block;
    }
    }

.btn{
cursor:pointer;
pointer-events:auto;

}
`