import React, { Component } from 'react';
import { connect } from "react-redux";

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

		<div className="floating">
		<form>
		<label>point size: <input name="pointsize" type="range" max="51" step="5" min="1"
	    value={this.props.view.pointsize}
	    onChange={ (event) => {

		this.props.setPointSize(Number(event.target.value))

	    } }/>
		</label>
		<label>
		<CirclePicker />
	    </label>
	    </form>
	    </div>
	    
		</div>
	)

    }

}



function mapStateToProps( { view, app}){
    return {view, app};
}

export default connect( mapStateToProps, { setPointSize, setColorMap, setFullscreen } )(ViewConfig);
