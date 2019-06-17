import React, {Component} from 'react';

import { connect } from "react-redux";
import styled from 'styled-components';
import {NavLink} from "react-router-dom";

import {setSelectionTime } from "../actions"

import Search from 'react-icons/lib/md/search';




import { Button } from 'styled-button-component';






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
class SearchBox extends Component{
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
        .then((myJson)=>{
          console.log("SLICE WILL BE SET");
          this.props.setActiveSlice(myJson);
          console.log("SLICE SET");
          this.props.setSelectionTime(Date.now());
        });

    }


    //returns left and right controls containing FOV / camera manipulation
    //and dataset manipulation controls respectively
    render(){
	return <StyledSearchBox>
    <input type="search"
    onChange={this.handleChange.bind(this)}></input><Search className={"btn"}/>
    <div className="options">  
    <form action="">
    <li><input type="radio" name="searchtype" value="umigeneids" id="geneids" disabled={false}       
            checked={this.state.selectedOption === "umigeneids"}
            onChange={this.handleOptionChange}
            /><label htmlFor="geneids">NCBI Gene Ids or Symbols</label></li>
    <li><input type="radio" name="searchtype" value="sequences" id="sequences"    disabled={false}      
            checked={this.state.selectedOption === "sequences"}
            onChange={this.handleOptionChange}
            /><label htmlFor="sequences">Sequence Matches</label></li>
    <li><input type="radio" name="searchtype" value="cellgoterms" id="cellgoterms"  disabled={false}       
            checked={this.state.selectedOption === "cellgoterms"}
            onChange={this.handleOptionChange}
            /><label htmlFor="cellgoterms">Segment Go Terms</label></li>

    </form>
    </div>
        </StyledSearchBox>;
        }

    handleOptionChange = changeEvent => {
        this.setState({
        selectedOption: changeEvent.target.value
        });
    };
  
}

export default connect(({})=>{return{}}, { setSelectionTime })(SearchBox);


const StyledSearchBox=styled.div`
    position:relative;
    width: 200px;
    border:2px solid blue;
    border-radius:2px;
div.options{
    position:absolute;
    bottom:100%;

    form{   
    li{
        display:block;
    }
    }
}
`