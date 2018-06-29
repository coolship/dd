import { combineReducers } from "redux";

import data from "./dataReducer";
import auth from "./authReducer";
import datasets from "./datasetsReducer";
import app from "./appReducer";
import view from "./viewReducer";
import dataset from "./datasetReducer";
import backend from "./backendReducer";


export default combineReducers({
    data,
    auth,
    datasets,
    app,
    view,
    dataset,
    backend
});

