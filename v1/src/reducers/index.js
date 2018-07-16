import { combineReducers } from "redux";

import data from "./dataReducer";
import auth from "./authReducer";
import datasets from "./datasetsReducer";
import app from "./appReducer";
import view from "./viewReducer";
import viewport from "./viewportReducer";
import dataset from "./datasetReducer";
import mouse from "./mouseReducer";
import selection from "./selectionReducer";
import query from "./queryReducer";


export default combineReducers({
    data,
    auth,
    datasets,
    app,
    view,
    dataset,
    mouse,
    viewport,
    selection,
    query,
});

