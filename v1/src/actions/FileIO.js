import * as firebase from "firebase";
import { storageRef, datasetsRef } from "../config/firebase";
import { SET_CURRENT_DATASET, SET_WAITING_FOR_DATA } from "./types";



function filenameFromEmailDataset(email,dataset){
    const email_id = userIdFromEmail(email)
    const file_id = dataset.replace(/[^a-zA-Z0-9]/g,"_")
    const filename = email_id+"/"+file_id
    return filename
}

export const userIdFromEmail = function(email){
    return email.replace(/[^a-zA-Z0-9]/g,"_")
}


export const activateDataset = (metadata) => dispatch => {

    dispatch({
	type:SET_WAITING_FOR_DATA,
	payload:true
    })

    console.log("waiting")

    // This can be downloaded directly:
    var xhr = new XMLHttpRequest();
    //can also use xhr.responseType="blob";
    xhr.responseType = 'json';
    xhr.onload = function(event) {
	console.log("xhr returned")
	var jsondata = xhr.response;
	dispatch({
	    type:SET_CURRENT_DATASET,
	    payload: {metadata:metadata,
		      json:jsondata}
	})
	dispatch({
	    type:SET_WAITING_FOR_DATA,
	    payload:false
	})
	console.log("done waiting");
	
	
    };
    xhr.open('GET', metadata.downloadUrl);
    xhr.send();    
}



export const uploadFromForm = (file, dataset, email)  => dispatch => {

    const filename = filenameFromEmailDataset(email, dataset)
    const userId = userIdFromEmail(email)
    const metadata = {
	email: email,
	dataset: dataset,
	userid:userId,
    }

// Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = storageRef.child(filename).put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
	firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
	function(snapshot) {
	    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
	    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
	    console.log('Upload is ' + progress + '% done');
	    switch (snapshot.state) {
	    case firebase.storage.TaskState.PAUSED: // or 'paused'
		console.log('Upload is paused');
		break;
	    case firebase.storage.TaskState.RUNNING: // or 'running'
		console.log('Upload is running');
		break;
	    }
	}, function(error) {

	    // A full list of error codes is available at
	    // https://firebase.google.com/docs/storage/web/handle-errors
	    switch (error.code) {
	    case 'storage/unauthorized':
		// User doesn't have permission to access the object
		break;

	    case 'storage/canceled':
		// User canceled the upload
		break;

	    case 'storage/unknown':
		// Unknown error occurred, inspect error.serverResponse
		break;
	    }
	}, function() {
	    // Upload completed successfully, now we can get the download URL
	    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
		console.log('File available at', downloadURL);
		datasetsRef.child(userIdFromEmail(email)).push().set({
		    dataset:dataset,
		    email:email,
		    downloadUrl:downloadURL,
		    userId:userId,
		    filename:filename,
		})
		
		
	    });
	});

    return null
    

 
}

