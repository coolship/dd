
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
        this.cell_ds = new CellDataset(
           { which_dataset:this.props.match.params.number}
        )
        this.state = {}
        const range = { x0:0, y0:0, x1:.25, y1:.25}
        this.state.range = range;


    }
    onNameChanged(ev){
        console.log(ev.target.value)
        datasetsRef.child("all_v2").child(this.getKey()).update({
            "display_name":ev.target.value
        })
    }
    getKey(){
        return _.invert(_.mapValues(this.props.datasets,"dataset"))[this.props.match.params.number]
    }
    
    getDataset(){
        return this.props.datasets[this.getKey()]
    }
    render(){
        return(

        <div className={this.props.className}>
        <h1>{this.getDataset().display_name}</h1> 
        <h1>{this.props.match.params.number}</h1> 
        <label htmlFor="edit-name">
            <input id="edit-name" type="text" onChange={this.onNameChanged.bind(this)}/>
        </label>
        <ul>
            <li>{this.cell_ds.getCells()?this.cell_ds.getCells().length:null}</li>
            <li>{this.cell_ds.getStats()?this.cell_ds.getStats().n_cells:null} cells</li>
            <li>{this.cell_ds.getStats()?this.cell_ds.getStats().n_umis:null} umis</li> 
        </ul>
        <img src={`${process.env.REACT_APP_API_URL}/dataset/${this.props.match.params.number}/preview2k`}/>
        

        <CellDataset3dView cell_ds={this.cell_ds} width={600} height={600}/>
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
        console.log(this.props.datasets)
        if (Object.keys(this.props.datasets).length > 0) {
            return(
                <Switch>
                <Route title="List" exact path='/edit'
                render={()=><div className={this.props.className} >This would be a list of datasets</div>}
                    // render={(props) => <GalleryList {...props} demos={this.props.demos} />}
                />
                <Route path='/edit/:number'
                    render={(props) => <EditDataset  className={this.props.className} {...props} datasets={this.props.datasets} />}
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
img{
    display:none;
}
.cell-dataset-3d-view-canvas{
    display:block;
    margin-left:auto;
    margin-right:auto;
}
`
export default connect(({datasets,auth})=>{return {datasets,auth}},{fetchDatasets,userIdFromEmail})(StyledEditDatasetRouter)