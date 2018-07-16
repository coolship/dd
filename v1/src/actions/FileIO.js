import * as firebase from "firebase";
import FileUploadProgress  from 'react-fileupload-progress';
import { storageRef, datasetsRef, umiMetasRef,typesMetasRef } from "../config/firebase";
import { SET_CURRENT_DATASET, SET_WAITING_FOR_DATA , SET_CURRENT_TYPES_JSON, SET_CURRENT_UMIS_JSON } from "./types";


/*
Files stored for dna microscopy are uploaded to firebase storage, with
pointers to each file stored in firebase realtime database with all other
application data

Database files are referred to as at:
[firebase]
/datasets/{USERID}/key --> metadata

Metadata has type:

  dataset:dataset, (dataset name)
  email:email, (user email)
  downloadUrl:downloadURL, (download path of database file)
  userId:userId, (user email replaced by _)
  filename:filename, (file path on FB storage)
  key:key, (key of this database reference)
  umis_url:null, (set when a UMI file is uploaded)
  types_url:null, (set when a TYPES file is uploaded)

*/

export const FILETYPES={
    DATASET:"dataset",
    UMIS:"umis",
    TYPES:"types"
}


function filenameFromMetadata({email,dataset},filetype=FILETYPES.DATASET){
    const email_id = userIdFromEmail(email);
    const file_id = dataset.replace(/[^a-zA-Z0-9]/g,"_");
    const filename = email_id+"/"+(filetype)+"_"+file_id;
    return filename;
}

export const userIdFromEmail = function(email){
    return email.replace(/[^a-zA-Z0-9]/g,"_");
}


export const deleteDataset = (metadata) => dispatch => {
    const {email, dataset, key} = metadata;    
    dispatch({
	type:SET_CURRENT_DATASET,
	payload:null
    }); 
    const filename = filenameFromMetadata(metadata,FILETYPES.DATASET);
    var deleteTask = storageRef.child(filename).delete().then(function(){
	datasetsRef.child(userIdFromEmail(email)).child(key).remove();	
    }).catch((error)=>{
	console.log("error deleting file "+dataset, error);
	datasetsRef.child(userIdFromEmail(email)).child(key).remove();	
    });    
};

export const activateDataset = (metadata) => dispatch => {
    dispatch({
	type:SET_WAITING_FOR_DATA,
	payload:true
    });
    
    // This can be downloaded directly:
    var xhr = new XMLHttpRequest();
    //can also use xhr.responseType="blob";
    xhr.responseType = 'json';
    xhr.onload = function(event) {
	var jsondata = xhr.response;
	dispatch({
	    type:SET_CURRENT_DATASET,
	    payload: {metadata:metadata,
		      json:jsondata}
	});
	dispatch({
	    type:SET_WAITING_FOR_DATA,
	    payload:false
	});
    };
    xhr.open('GET', metadata.downloadUrl);
    xhr.send();

    // This can be downloaded directly:
    var xhr2 = new XMLHttpRequest();
    //can also use xhr.responseType="blob";
    xhr2.responseType = 'json';
    xhr2.onload = function(event) {
	var jsondata = xhr2.response;
	dispatch({
	    type:SET_CURRENT_UMIS_JSON,
	    payload: jsondata
	});
    };
    xhr2.open('GET', metadata.umis_url);
    xhr2.send();

    // This can be downloaded directly:
    var xhr3 = new XMLHttpRequest();
    //can also use xhr.responseType="blob";
    xhr3.responseType = 'json';
    xhr3.onload = function(event) {
	var jsondata = xhr3.response;
	dispatch({
	    type:SET_CURRENT_TYPES_JSON,
	    payload: jsondata
	});
    };
    xhr3.open('GET', metadata.types_url);
    xhr3.send();  
}





export const deleteAnnotation= (meta, type) => dispatch =>{
    const {key,email} = meta;

    if(type == FILETYPES.UMIS){
	datasetsRef.child(userIdFromEmail(email)).child(key).update({
	    umis_url:null
	});
	dispatch({
	    type:SET_CURRENT_UMIS_JSON,
	    payload:null
	});
    } else if (type== FILETYPES.TYPES){

	datasetsRef.child(userIdFromEmail(email)).child(key).update({
	    types_url:null
	});
	dispatch({
	    type:SET_CURRENT_TYPES_JSON,
	    payload:null
	});
    }
}

export const uploadFiletypeWithCallbacks = (file,type,meta,callbacks) => dispatch => {
    const filename = filenameFromMetadata(meta,type);
    var uploadTask = storageRef.child(filename).put(file);
    var {dataset,email} = meta;
    const userId = userIdFromEmail(email);

    console.log(callbacks.progress)
    
    uploadTask.on(
	firebase.storage.TaskEvent.STATE_CHANGED,
	(snapshot)=>{callbacks.progress(100* snapshot.bytesTransferred/snapshot.totalBytes);},
	callbacks.error,
	()=>{
	    if(type===FILETYPES.UMIS){
		uploadTask.snapshot.ref.getDownloadURL().then(
		    function(downloadURL) {

			datasetsRef
			    .child(userIdFromEmail(meta.email))
			    .child(meta.key)
			    .update({umis_url:downloadURL});
			
			var xhr2 = new XMLHttpRequest();
			xhr2.responseType = 'json';
			xhr2.onload = function(event) {
			    var jsondata = xhr2.response;
			    dispatch({
				type:SET_CURRENT_UMIS_JSON,
				payload: jsondata
			    });
			};
			xhr2.open('GET',downloadURL);
			xhr2.send();
		    }
		);
	    } else if (type ===FILETYPES.TYPES){
		uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {

		    datasetsRef
			.child(userIdFromEmail(meta.email))
			.child(meta.key)
			.update({types_url:downloadURL});
		    
		    var xhr2 = new XMLHttpRequest();
		    xhr2.responseType = 'json';
		    xhr2.onload = function(event) {
			var jsondata = xhr2.response;
			dispatch({
			    type:SET_CURRENT_TYPES_JSON,
			    payload: jsondata
			});
		    };
		    xhr2.open('GET',downloadURL);
		    xhr2.send();
		});
	    } else {

		// Upload completed successfully, now we can get the download URL
		uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
		    var newObject=datasetsRef.child(userIdFromEmail(email)).push();
		    var key = newObject.key;
		    newObject.set({
			dataset:dataset,
			email:email,
			downloadUrl:downloadURL,
			userId:userId,
			filename:filename,
			key:key
		    });
		});   
	    }
	    callbacks.complete();
	}
    );
};



