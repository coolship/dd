import React, {Component} from 'react';
import SearchBox from './SearchBox';
import styled, {css} from 'styled-components';
import Search from 'react-icons/lib/md/search';
import FileDownload from 'react-icons/lib/md/file-download';
import Accordion from 'react-tiny-accordion'

export default class DatasetWrangler extends Component {
    constructor(props) {
        super(props)
    }

    // returns left and right controls containing FOV / camera manipulation and
    // dataset manipulation controls respectively
    render() {
        return <StyledDatasetWrangler className="hello">

            <Accordion
                className='accordion'
                transitionDuration='200'
                openClassName="selected">
                <div data-header={< div > <Search/>QUERY </ div>}>
                    <SearchBox
                        setActiveSlice={this.props.setActiveSlice}
                        which_dataset={this.props.which_dataset}
                        style={{
                        left: "500px",
                        position: "relative"
                    }}/>
                </div>
                <div data-header={< DataHeaderTest />}>
                    <ExportBox></ExportBox>
                </div>
            </Accordion>
        </StyledDatasetWrangler>

    }
};

const DataHeaderTest = (props) =>< div > <FileDownload/>EXPORT </div>

const ExportBox = (props) =><StyledExportBox>
	--EXPORT SELECTION--
		<form>
	<div className="radio">
  <label><input type="radio" value="all" name="export_which" checked/> selected umis </label>
</div > <div className="radio">
    <label><input type="radio" value="selected" name="export_which" disabled/>all umis</label>
</div> < br /> --EXPORT TYPE-- <div className="radio">
    <label><input type="radio" value="fasta" name="export_what" checked/>fasta format sequences and coordinates</label>
</div> < div className = "radio" > <label><input type="radio" value="umis csv" name="export_what"/>.csv file, (?) --> sequences, coordinates and GO terms</label>
</div>
<div className="radio disabled">
<label><input type="radio" value="segments csv" name="export_what" disabled/>segments file, (?) --> segments, with aggregrate statistics</label>
</div>
--SUBMIT--
<input type="submit"/>
</form>
</StyledExportBox>

const StyledExportBox=styled.div`
width:100%;
position:relative;
`;

const StyledDatasetWrangler=styled.div`
width:200px;
position:absolute;
height:auto;
top:50%;
transform:translate(0, -50%);


.accordion {
	border-bottom: 1px solid #999;
  }
  
  /* Header */
  .accordion > div > div:first-of-type {
	
	border: 2px solid white;
	border-radius:3px;
	border-bottom: 0px;
	padding: .5em;
	font-size:1.3em;

  }
  
  /* Content */
  .accordion > div > div:last-of-type {
	border-left: 2px solid white;
	border-right: 2px solid white;
	border-radius:3px;
  }

`;
