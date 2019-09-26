import React, { Component } from 'react';
import { datasetsRef } from '../config/firebase';
import { connect } from "react-redux";


class EditDataset extends Component {
    onNameChanged(ev){
        datasetsRef.child("all").child(key).update({
            "display_name":name
        })

    }

    getDataset(){
        return this.props.datasets.filter((d)=>
            d.key = this.props.dataset_key
        )
    }
    render(){
        return(
        <div>
        <h1>{this.getDataset().name}</h1>
        <label for="edit-name">
            <input id="edit-name" type="text" onChange={this.onNameChanged.bind(this)}/>
        </label>
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
                <Route title="List" exact path='/gallery'
                render={()=><div >This would be a list of datasets</div>}
                    // render={(props) => <GalleryList {...props} demos={this.props.demos} />}
                />
                <Route path='/gallery/:number'
                    render={(props) => <EditDataset {...props} datasets={this.props.datasets} />}
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

export default connect(({datasets,auth})=>{return {datasets,auth}},{fetchDatasets})(EditDatasetRouter)