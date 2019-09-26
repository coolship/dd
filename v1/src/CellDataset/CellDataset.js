
import React from 'react';

class CellDetailsList {
    constructor(props){
        console.log("initializing collection")
        this.props = props
    }
    setQuery(query){
        this.state.query = query
        var url = new URL( process.env.REACT_APP_API_URL+`/api/${this.props.which_dataset}/cells/`)
        var params={query: query}
        url.search = new URLSearchParams(params)


        this.state.fetching = fetch(
            url
        ).then(function (response) {
			return (response.json())
		}).then(myJson => { this.server_stats = myJson }
		)

    }
}



export default class CellDataset {
    constructor(props){
        window.cur_cell_dataset = this;
        this.which_dataset = props.which_dataset;
        this.fetching=this.fetch_all();

        this.state = {}        
        this.cl = new CellDetailsList({which_dataset:this.which_dataset})
    }
    
    ComponentDidMount(){
        this.state.query  =  {x0:0,
            y0:0,
        x1:.25,
        y1:.25,
        }
        this.cl.setQuery({query:this.state.query})
    }
    getStats(){
        return this.server_stats
    }
    getCells(){
        return this.cells
    }
    async fetch_all(){
        return Promise.all([
        this.fetch_server_stats(),
        this.fetch_cells()
        ])
    }

    async fetch_server_stats(){
        return fetch(
            process.env.REACT_APP_API_URL+`/dataset_stats/${this.which_dataset}`
        ).then(function (response) {
			return (response.json())
		}).then(myJson => { this.server_stats = myJson }
		)
    }

    async fetch_cells(){
        return fetch(
            process.env.REACT_APP_API_URL+`/cells/all/${this.which_dataset}`
        ).then(function (response) {
			return (response.json())
		}).then(myJson => { this.cells = myJson }
		)
    }
}