import React,{useState} from "react";
import styled, {css} from "styled-components";
import { connect } from "react-redux";
import CellDataset from "../CellDataset/CellDataset";
import CellDataset3dView from "../CellDataset/CellDataset3dView"




const CellDatasetHOC =(props)=>{
    /* strip authorization from props passed to child */
    const {auth, WrappedComponent, ...passThroughProps} = props;
    if (! WrappedComponent){throw ("no wrapped component!")}
    const [cells, setCells] = useState(false);
    const [details, setDetails] = useState(false);
    const [selection, setSelection] = useState(false);
    const [stats, setStats] = useState(false);

    return (
        <span>
        {/* set data handlers to cell dataset*/}
        <CellDataset
            setCellsHandler={setCells.bind(this)}
            setStatsHandler={setStats.bind(this)}
            setDetailsHandler={setDetails.bind(this)}
            which_dataset={props.which_dataset}
            {...{selection}}
        />
        {/* pass interaction handlers to wrapped component*/}
        <WrappedComponent 
            setSelectionHandler={setSelection.bind(this)}
            {...passThroughProps/*display-related props, such as className*/}
            {...{cells,details,stats}}/>
        </span>
    )
}

const withCellDatasetHOC = (WrappedComponent) => (
    connect(({auth, datasets}) => {
        return {auth, datasets, WrappedComponent}; // this injection may not work!
    }, {})(CellDatasetHOC)
)

/* functional component generates cell router view */
export default withCellDatasetHOC((props)=>props.cells
?<CellDataset3dView 
    setSelectionHandler={props.setSelection}
    cells={props.cells} 
    details={props.details}
    width={1200} 
    height={1200}/>
: <div styles={{
top:'50vh',
textAlignment:'center',
color:'yellow'
}}>waiting for cells to load...</div>)


// export default connect(({datasets,auth})=>{return {datasets,auth}},{fetchDatasets,userIdFromEmail})(CellDataset3dView)