import React, { Component } from 'react';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';
import Search from 'react-icons/lib/md/search';



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
        this.state = {opt:"cellgoterms"}
    }
    handleChange(e) {
        var urls = {
            "umigeneids":"/queries/umis/geneids/",
            "umigoterms":"/queries/umis/goterms/",
            "sequences":"/queries/umis/sequence/",
            "alignments":"/queries/umis/alignments/",
            "spliced":"/queries/umis/spliced/",
            "cellgoterms":"/queries/cells/goterms/",
            "cellgeneids":"/queries/cells/geneids/",

        };  

        let val = e.target.value
        this.setState({search_value:val})
        let ds = this.props.dataset;
        let which = this.props.which_dataset;
                

        console.log("@SearchBox.js running a serverside query for " + val + "... feature is still in experimental mode. \n[TODO]: implement as production feature. ")
        if (val.length < 4){
            ds.unsetUmiSlice()
            return
        }        

        fetch("http://35.237.243.111:5000"+urls[this.state.opt]+which+"/"+val,) 
        .then(function(response) {
          return response.json();
        })

        .then(function(myJson) {
          ds.setUmiSlice(myJson)
        });

    }


    //returns left and right controls containing FOV / camera manipulation
    //and dataset manipulation controls respectively
    render(){
	return <StyledSearchBox>
    <input type="search"
    onChange={this.handleChange.bind(this)}></input><Search className={"btn"}/>
    <div>  
    <form action="">
    <h3>umi queries</h3>
    <li><input type="radio" name="searchtype" value="geneids" id="geneids" disabled={true}       
            checked={this.state.opt === "geneids"}
            onChange={this.handleOptionChange}
            /><label htmlFor="geneids">Gene IDs (Ensembl or NCBI)</label></li>
    <li><input type="radio" name="searchtype" value="sequences" id="sequences"    disabled={true}      
            checked={this.state.opt === "sequences"}
            onChange={this.handleOptionChange}
            /><label htmlFor="sequences">Sequence Matches</label></li>
    <li><input type="radio" name="searchtype" value="alignments" id="alignments"     disabled={true}    
            checked={this.state.opt === "alignments"}
            onChange={this.handleOptionChange}
            /><label htmlFor="alignments">Gapped Alignments</label></li>
    <li><input type="radio" name="searchtype" value="spliced" id="spliced"  disabled={true}        
            checked={this.state.opt === "spliced"}
            onChange={this.handleOptionChange}
            /><label htmlFor="spliced">Spliced Transcripts</label></li>
    <li><input type="radio" name="searchtype" value="umigoterms" id="umigoterms"  disabled={true}       
            checked={this.state.opt === "umigoterms"}
            onChange={this.handleOptionChange}
            /><label htmlFor="umigoterms">UMI GO terms</label></li>

    <h3>cell queries</h3>
    <li><input type="radio" name="searchtype" value="cellgoterms" id="cellgoterms"        
            checked={this.state.opt === "cellgoterms"}
            onChange={this.handleOptionChange}
            /><label htmlFor="cellgoterms">Cell GO Terms</label></li>

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