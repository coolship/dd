
import React,{Component} from 'react';
import initREGL from 'regl';
import _ from 'lodash';
function eqSet(as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
}



class CellDetailsList extends Component{

    constructor(props){
        console.log("constructing details list")
        super(props)
        this.state={}
    }
    componentDidMount = ()=>{
        console.log("MOUNTED!")
        this.fetch()
    }

    setResult(details){

 

        this.setState({details: details})

        

        this.props.setDetailsHandler?this.props.setDetailsHandler(details):null;
    }

    componentDidUpdate = (prevProps) => {
        console.log(prevProps)
        console.log(this.props)
        const prevSel = new Set(prevProps.ids);
        const nextSel = new Set(this.props.ids);
        eqSet(prevSel, nextSel)?null:this.fetch();
    }
    
    fetch(){
        console.log("fetching")
        var url = new URL( process.env.REACT_APP_API_URL+`/api/${this.props.which_dataset}/cell_neighborhoods/`)
        console.log(this.props.ids)
        url.search = new URLSearchParams(
            {ids:JSON.stringify(this.props.ids),
            attrs:JSON.stringify(["meanx","meany","id","rgb","xy","hull_xy", "points_xy","kde_array_20"])
            })
        this.setState({fetch_status:"Pending"})
        fetch(url)
        .then(function (response) {return (response.json())})
        .then(myJson => {
            console.log("fetched cell details", myJson)
            this.setResult(myJson)
            this.setState({fetch_status:"Fulfilled"})
        })
    }
    render=()=>{
        console.log(this.state.ids)
    return ((this.state.fetch_status)?(<span>{this.state.fetch_status}</span>) : <span>{this.state.fetch_status}</span>)
    }
}




export default class CellDataset extends Component{
    constructor(props){
        super(props)
        window.cur_cell_dataset = this;
        this.which_dataset = props.which_dataset;
        this.fetching=this.fetch_all();
        this.state = {}        
        this.cell_details = null;
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
            process.env.REACT_APP_API_URL+`/dataset_stats/${this.props.which_dataset}`
        ).then(function (response) {
			return (response.json())
		}).then(myJson => { 
            this.server_stats = myJson 
            this.props.setStatsHandler?this.props.setStatsHandler(this.server_stats):null;
        }
		)
    }

    async fetch_cells(){
        return fetch(
            process.env.REACT_APP_API_URL+`/cells/all/${this.which_dataset}`
        ).then(function (response) {
			return (response.json())
        }).then(myJson => {
            this.cells = myJson 
            this.props.setCellsHandler?this.props.setCellsHandler(this.cells):null;
        }
		)
    }

    render(){
        console.log(this.props.selection)
        return this.props.selection?
        <CellDetailsList 
            ids={this.props.selection}
            which_dataset={this.props.which_dataset}
            setDetailsHandler={this.props.setDetailsHandler}/>:null;
            
    }
}