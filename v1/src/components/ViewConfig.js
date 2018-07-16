import React, { Component } from 'react';
import { connect } from "react-redux";
import styled, { css } from 'styled-components';



import {setPointSize, setColorMap, setFullscreen} from '../actions';

//images
import Fullscreen from 'react-icons/lib/md/fullscreen';
import FullscreenExit from 'react-icons/lib/md/fullscreen-exit';

import { CirclePicker } from 'react-color';




class ViewConfig extends Component {


    render(){

	return (
	    <div className="view-config">
	      <label className="toggle-fullscreen">
		<Fullscreen className="toggle-fullscreen-on icon"/>
		<FullscreenExit className="icon toggle-fullscreen-off"/>
		<input type="checkbox"
		       id="app-toggle-fullscreen"
		       checked={!! this.props.app.is_fullscreen }
		       className="toggle-fullscreen"
		       onChange={(event) => {this.props.setFullscreen(event.target.checked)}}/>
	      </label>
	    </div>	    
	);

    }

}



function mapStateToProps( { view, app}){
    return {view, app};
}

export default connect( mapStateToProps, { setPointSize, setColorMap, setFullscreen } )(ViewConfig);




.viewer.fullscreen{
    .toggle-fullscreen-on{
	display:none;
    }
}

.viewer:not(.fullscreen){
    .toggle-fullscreen-off{
	display:none;
    }
}


const ToggleFullscreen=styled.div`
    input{
	display:none;
    }
    position:fixed;
    top:0px;
    left:0px;
    margin:10px;

`;
