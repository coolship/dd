
import { todosRef, authRef, provider, storageRef, datasetTestRef, databasesStorageRef, datasetsRef } from "../config/firebase";

import { userIdFromEmail } from "./FileIO";
import { FETCH_TODOS, FETCH_USER, FETCH_DATASETS, SET_CURRENT_DATASET, SET_COLORMAP, SET_POINTSIZE, SET_FULLSCREEN , SET_SELECT_UMI_IDX, SET_SELECT_TYPE, RESET_APP, SET_TRANSFORM , SET_MOUSE_XY, SET_VIEWPORT_WH} from "./types";


export const setMouse = (mouse) => dispatch => {
    dispatch({
	type:SET_MOUSE_XY,
	payload:mouse
    })
}


export const setViewport = (viewport) => dispatch => {
    dispatch({
	type:SET_VIEWPORT_WH,
	payload:viewport
    })
}



export const resetApp = () => dispatch => {
    dispatch({
	type:RESET_APP,
	payload:null,
    })
}

export const setTransform = (transform) => dispatch => {
    dispatch({
	type:SET_TRANSFORM,
	payload:transform
    })
}


export const setSelectUmiIdx = (idx) => dispatch => {
    dispatch({
	type: SET_SELECT_UMI_IDX,
	payload:idx
    })
}

export const setSelectType = (type) => dispatch => {
    dispatch({
	type:SET_SELECT_TYPE,
	payload:type
    })
}


export const fetchUser = () => dispatch => {
    authRef.onAuthStateChanged(user => {
	if (user) {
	    dispatch({
		type: FETCH_USER,
		payload: user
	    });
	} else {
	    dispatch({
		type: FETCH_USER,
		payload: null
	    });
	}
    });
};

export const setColorMap = (colormap) => dispatch =>{
    dispatch({
	type:SET_COLORMAP,
	payload:colormap
    })
}

export const setPointSize = (pointsize) => dispatch =>{
    dispatch({
	type:SET_POINTSIZE,
	payload:pointsize
    })
}


export const setFullscreen = (fullscreen) => dispatch =>{
    dispatch({
	type:SET_FULLSCREEN,
	payload:fullscreen
    })
}

export const fetchDatasets = email =>  dispatch => {
    console.log("fetching datasets from server")
    datasetsRef.child(userIdFromEmail(email)).on("value", snapshot => {
    dispatch({
      type: FETCH_DATASETS,
      payload: snapshot.val()
    });
  });
};

export const signIn = () => dispatch => {
  authRef
    .signInWithPopup(provider)
	.then(result => {})
    .catch(error => {
      console.log(error);
    });
};

export const signOut = () => dispatch => {
  authRef
    .signOut()
    .then(() => {
      // Sign-out successful.
    })
    .catch(error => {
      console.log(error);
    });
};
