import React, {Component} from 'react';
import SearchBox from './SearchBox';
import styled, {css} from 'styled-components';
//import Search from 'react-icons/lib/md/search';
import FileDownload from 'react-icons/lib/md/file-download';

export default class DatasetWrangler extends Component {
    constructor(props) {
        super(props)
    }

    // returns left and right controls containing FOV / camera manipulation and
    // dataset manipulation controls respectively
    render() {
        return <StyledDatasetWrangler className="hello">
			<StyledAccordionItem className="item-hidden">
                <SearchBox
                    which_dataset={this.props.which_dataset}
                    dataset={this.props.dataset}
                    style={{
                    left: "500px",
                    position: "relative"
                }}/>
				</StyledAccordionItem>
<StyledAccordionItem>
			<ExportBox></ExportBox>
			</StyledAccordionItem>	
        </StyledDatasetWrangler>
		
    }
};

const ExportBox = (props) =><StyledExportBox className={props.className}> <FileDownload/> </StyledExportBox>

const StyledAccordionItem=styled.li`
	&.item-hidden{
		height:20px;
	}
	&:not(.item-hidden){
		height:auto;
	}
`

const StyledDatasetWrangler=styled.div`
background-color: blue;
width:300px;
position:absolute;
height:400px;
top:50vh;
margin-top:-200px;

`;

const StyledExportBox=styled.div`
width:100%;
height:50px;
position:relative;
background-color:red;
`;