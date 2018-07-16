
import { todosRef, authRef, provider, storageRef, datasetTestRef, databasesStorageRef, datasetsRef } from "../config/firebase";

import { userIdFromEmail } from "./FileIO";
import { FETCH_TODOS,  FETCH_USER, FETCH_DATASETS, SET_CURRENT_DATASET, SET_COLORMAP, SET_POINTSIZE, SET_FULLSCREEN , SET_SELECT_UMI_IDX, SET_SELECT_TYPE, RESET_APP, SET_TRANSFORM , SET_MOUSE_XY, SET_VIEWPORT_WH, SET_VIEWPORT_TRANSFORM, SET_VIEWPORT_XY, SET_QUERY_UMI_SUBSTRING, SET_QUERY_UMI_TYPE, SET_APP_MODAL } from "./types";



export const closeModal =() => dispatch => {
    dispatch({
	type:SET_APP_MODAL,
	payload:null,
    })
}

export const activateModal = (name) => dispatch => {
    dispatch({
	type:SET_APP_MODAL,
	payload:name
    })
}

export const setMouse = (mouse) => dispatch => {
    dispatch({
	type:SET_MOUSE_XY,
	payload:mouse
    })
}

export const setViewportWH = (viewportWH) => dispatch => {
    dispatch({
	type:SET_VIEWPORT_WH,
	payload:viewportWH
    })
}

export const setViewportTransform = (viewportTransform) => dispatch => {
    dispatch({
	type:SET_VIEWPORT_TRANSFORM,
	payload:viewportTransform
    })
}

export const setViewportXY = (viewportXY) => dispatch =>{
    dispatch({
	type:SET_VIEWPORT_XY,
	payload:viewportXY
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

export const setQueryUmiSubstring = (substring) => dispatch => {
    dispatch({
	type: SET_QUERY_UMI_SUBSTRING,
	payload: substring
    });
}

export const setQueryUmiType = (type) => dispatch => {
    dispatch({
	type: SET_QUERY_UMI_TYPE,
	payload: type
    });
}
