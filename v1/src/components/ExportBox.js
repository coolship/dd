import React, {Component} from 'react';

import { connect } from "react-redux";
import styled from 'styled-components';



const StyledExportBox=styled.div`
width:100%;
position:relative;
`;

const ExportBox = (props) =><StyledExportBox>
    <div><ul>
    <li><a href='http://35.237.243.111:5000/export/5838205499823053/csv' download>DOWNLOAD AS CSV</a></li>
    <li><a href='http://35.237.243.111:5000/export/5838205499823053/fasta' download>DOWNLOAD AS FASTA</a></li>
        </ul>
        </div>
</StyledExportBox>

export default ExportBox;

