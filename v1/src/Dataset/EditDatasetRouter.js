
import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import { datasetsRef } from '../config/firebase';
import { connect } from "react-redux";
import { fetchDatasets } from "../actions";
import { userIdFromEmail } from "../actions/FileIO";

import styled from "styled-components"
import _ from "lodash";

import CellDataset3dView from "../CellDataset/CellDataset3dView";
import CellDataset from "../CellDataset/CellDataset";

class EditDataset extends Component {
    constructor(props){
        super(props)
        this.state = {}
        const range = { x0:0, y0:0, x1:.25, y1:.25}
        this.state.range = range;


    }
    onNameChanged(ev){
        datasetsRef.child("all_v2").child(this.getKey()).update({
            "display_name":ev.target.value
        })
    }
    onFieldChange(change_field,val){
        datasetsRef.child("all_v2").child(this.getKey()).update({
            [change_field]:val
        })
    }


    setCells=(cells)=>this.setState({cells:cells})
    setStats=(stats)=>this.setState({stats:stats})
    setDetails=(details)=>this.setState({details:details})
    setSelection=(ids)=>this.setState({selection:ids})
    getKey(){return _.invert(_.mapValues(this.props.datasets,"dataset"))[this.props.match.params.number]}
    getDataset(){return this.props.datasets[this.getKey()]}
    setCells(cells){this.setState({cells :cells})}
    render(){
        return(
            
        <div className={this.props.className}>
            <div className="abs">
            <h1>{this.getDataset().display_name}</h1> 
            <h1>{this.props.match.params.number}</h1> 
            <ul>
            <li><label htmlFor="edit-name">
            <span className="label">display name</span>
                <input id="edit-name" 
                type="text" 
                value={this.getDataset().display_name}
                onChange={this.onNameChanged.bind(this)}/> 
            </label></li>
            <li>
            <label htmlFor="edit-process_transcriptome">
            <span className="label">process whole transcriptome</span>
                <input id="edit-process_transcriptome" 
                type="checkbox" 
                checked={this.getDataset().dataset_process_transcriptome?true:false}
                onChange={ev=>this.onFieldChange.bind(this)("dataset_process_transcriptome",ev.target.checked)}
                />
            </label></li>
            <li><label htmlFor="edit-description">
            <span className="label">description</span>
                <input id="edit-description" 
                type="text" 
                value={this.getDataset().dataset_description}
                onChange={ev=>this.onFieldChange.bind(this)("dataset_description",ev.target.value)}
                /> 
            </label>
            </li>
            </ul>
            {this.getDataset().server_process_status=="COMPLETE"?
            <span>
                    <CellDataset  
                        setCellsHandler={this.setCells.bind(this)}
                        setStatsHandler={this.setStats.bind(this)}
                        setDetailsHandler={this.setDetails.bind(this)}
                        selection={this.state.selection}
                        which_dataset={this.props.match.params.number}
                        />
                    <ul>
                        <li>{this.state.stats?this.state.stats.n_umis:null} umis</li> 
                    </ul>
                    <img src={`${process.env.REACT_APP_API_URL}/dataset/${this.props.match.params.number}/preview2k`}/>
                    </span>
                    :null}
            </div>
                {this.getDataset().server_process_status=="COMPLETE"?
                    <CellDataset3dView 
                    setSelectionHandler={this.setSelection.bind(this)}
                    cells={this.state.cells?this.state.cells:null} 
                    details={this.state.details}
                    width={1200} 
                    height={1200}/>
            :null}

        </div>
        
        )
    }
}

class EditDatasetRouter extends Component{
    constructor(props){
        super(props)
        this.props.fetchDatasets(userIdFromEmail(this.props.auth.email))
    }

    render(){
        if (Object.keys(this.props.datasets).length > 0) {
            return(
                <Switch>
                <Route title="List" exact path='/edit'
                render={()=><div className={this.props.className} >This would be a list of datasets</div>}
                    // render={(props) => <GalleryList {...props} demos={this.props.demos} />}
                />
                <Route path='/edit/:number'
                    render={(props) => 
                    <EditDataset  className={this.props.className} {...props} datasets={this.props.datasets} />}
                />
            </Switch>
            )
              
            } else {
                return (
                    <div
                    
                        style={{
                        top: "50%",
                        left: "50%",
                        position: "absolute",
                        backgroundColor: "rgba(0,0,1,.25)",
                        border:"2px solid blue",
                        borderRadius:"5px",
                        padding:"20px",
                        transform: "translate(-50%, -50%)"
                    }}>
                        Authenticating user, hang tight!
                    </div>
                )
            }
    }
}

const StyledEditDatasetRouter = styled(EditDatasetRouter)`
.abs{
    position:absolute;
    z-index:1;
}

li{
    list-style:none;
}

ul{

    margin-left:0px;
    padding-left:0px;
}

.label{
    display:block;
    padding-top:8px;
}

.cell-dataset-3d-view-canvas{
    display:block;
    margin-left:auto;
    margin-right:auto;
}
`
export default connect(({datasets,auth})=>{return {datasets,auth}},{fetchDatasets,userIdFromEmail})(StyledEditDatasetRouter)