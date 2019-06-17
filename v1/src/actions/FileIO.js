import * as firebase from "firebase";
import { storageRef, datasetsRef } from "../config/firebase";
import { SET_CURRENT_DATASET, SET_WAITING_FOR_DATA, SET_CURRENT_TYPES_JSON, SET_CURRENT_UMIS_JSON } from "./types";
import _ from "lodash";


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

export const FILETYPES = {
	DATASET: "dataset",
	UMIS: "umis",
	TYPES: "types",
	COORDS: "coords",
	ANNOTATIONS: "annotations",
	PREVIEW: "preview",
	RBUFFER: "rchannel",
	GBUFFER: "gchannel",
	BBUFFER: "bchannel",
	ABUFFER: "achannel",
	R_SEGBUFFER: "rschannel",
	G_SEGBUFFER: "gschannel",
	B_SEGBUFFER: "bschannel",
	A_SEGBUFFER: "aschannel",
	XBUFFER: "xbuffer",
	YBUFFER: "ybuffer",
	ZBUFFER: "zbuffer",
	XUMI_FEAT: "xumi_feat",
	XUMI_BASE: "xumi_base",
	XUMI_SEGMENT_FEAT: "xumi_segment_feat",
	XUMI_SEGMENT_BASE: "xumi_segment_base",
}


function filenameFromMetadata({ email, dataset }, filetype = FILETYPES.DATASET) {

	const email_id = userIdFromEmail(email);
	const file_id = dataset.replace(/[^a-zA-Z0-9]/g, "_");
	const filename = "/website_datasets/" + email_id + "/" + (filetype) + "_" + file_id;
	return filename;
}

export const userIdFromEmail = function (email) {
	return email.replace(/[^a-zA-Z0-9]/g, "_");
}

export const deleteDatasetAndAnnotations = (key, metadata) => dispatch => {
	//checks the filenames property of the metadata object to determine what files have been associated with this metadata

	Promise.all(_.map(metadata.filenames, function (v, k) {
		return storageRef.child(v).delete();
	})).then(
		() => {
			datasetsRef.child("all").child(key).remove();
		}
	);
};

export const deleteDataset = (key, metadata) => dispatch => {
	const { email, dataset } = metadata;
	dispatch({
		type: SET_CURRENT_DATASET,
		payload: null
	});
	const filename = filenameFromMetadata(metadata, FILETYPES.DATASET);
	var deleteTask = storageRef.child(filename).delete().then(function () {
		datasetsRef.child(userIdFromEmail(email)).child(key).remove();
	}).catch((error) => {
		console.log("error deleting file " + dataset, error);
		datasetsRef.child(userIdFromEmail(email)).child(key).remove();
	});
};

export const uploadPreview = (key, metadata, blob) => {
	const { email, dataset } = metadata;
	const filename = filenameFromMetadata(metadata, FILETYPES.PREVIEW);
	var filetype_meta = {
		contentType: 'image/jpeg',
	};

	const uploadTask = storageRef.child(filename).put(blob, filetype_meta);
	uploadTask.on(
		firebase.storage.TaskEvent.STATE_CHANGED,
		(snapshot) => { console.log(50 * snapshot.bytesTransferred / snapshot.totalBytes); },
		(err) => { throw err; },
		() => {
			// Upload completed successfully, now we can get the download URL
			uploadTask.snapshot.ref.getDownloadURL()
				.then((url) => {
					datasetsRef
						.child("all")
						.child(key)
						.update({ preview_url: url });
				});
		});
}

export const uploadBuffer = (key, metadata, name, typed_array) => dispatch => {

	var blob = new Blob([typed_array.buffer], { type: 'application/octet-stream' });
	const { email, dataset } = metadata;
	const filename = filenameFromMetadata(metadata, FILETYPES[name]);
	var filetype_meta = {
		contentType: 'application/octet-stream'
	};

	var newfile = storageRef.child(filename)
	const uploadTask = newfile.put(blob, filetype_meta);

	uploadTask.on(
		firebase.storage.TaskEvent.STATE_CHANGED,
		(snapshot) => { console.log(50 * snapshot.bytesTransferred / snapshot.totalBytes); },
		(err) => { throw err; },
		() => {

			// Upload completed successfully, now we can get the download URL
			uploadTask.snapshot.ref.getDownloadURL()
				.then((url) => {
					datasetsRef
						.child("all")
						.child(key)
						.update({ [name + "_url"]: url });
				});
		});
}

export const activateDataset = (metadata) => dispatch => {
	dispatch({
		type: SET_WAITING_FOR_DATA,
		payload: true
	});

	// This can be downloaded directly:
	var xhr = new XMLHttpRequest();
	//can also use xhr.responseType="blob";
	xhr.responseType = 'json';
	xhr.onload = function (event) {
		var jsondata = xhr.response;
		dispatch({
			type: SET_CURRENT_DATASET,
			payload: {
				metadata: metadata,
				json: jsondata
			}
		});
		dispatch({
			type: SET_WAITING_FOR_DATA,
			payload: false
		});
	};
	xhr.open('GET', metadata.downloadUrl);
	xhr.send();

	// This can be downloaded directly:
	var xhr2 = new XMLHttpRequest();
	//can also use xhr.responseType="blob";
	xhr2.responseType = 'json';
	xhr2.onload = function (event) {
		var jsondata = xhr2.response;
		dispatch({
			type: SET_CURRENT_UMIS_JSON,
			payload: jsondata
		});
	};
	xhr2.open('GET', metadata.umis_url);
	xhr2.send();

	// This can be downloaded directly:
	var xhr3 = new XMLHttpRequest();
	//can also use xhr.responseType="blob";
	xhr3.responseType = 'json';
	xhr3.onload = function (event) {
		var jsondata = xhr3.response;
		dispatch({
			type: SET_CURRENT_TYPES_JSON,
			payload: jsondata
		});
	};
	xhr3.open('GET', metadata.types_url);
	xhr3.send();
};



/*
takes upload form input of a coordinate and annotation file and sequentially 
posts these to the server, creating a database entry when both are successfully 
submitted
 */

export const uploadCoordsAndAnnotationsWithCallbacks = (coords_file, annotations_file, meta, callbacks) => dispatch => {
	const cfname = filenameFromMetadata(meta, FILETYPES.COORDS);
	const afname = filenameFromMetadata(meta, FILETYPES.ANNOTATIONS);
	var filetype_meta = {
		contentType: 'application/json',
		contentEncoding: 'gzip'
	};



	var uploadTask = storageRef.child(cfname).put(coords_file, filetype_meta);
	var { dataset, email } = meta;
	const userId = userIdFromEmail(email);

	uploadTask.on(
		firebase.storage.TaskEvent.STATE_CHANGED,
		(snapshot) => { callbacks.progress(50 * snapshot.bytesTransferred / snapshot.totalBytes); },
		callbacks.error,
		() => {

			// Upload completed successfully, now we can get the download URL
			uploadTask.snapshot.ref.getDownloadURL().then(function (cDownloadURL) {
				console.log("completed coordinate resource upload");
				var aUploadTask = storageRef.child(afname).put(annotations_file, filetype_meta);
				aUploadTask.on(
					firebase.storage.TaskEvent.STATE_CHANGED,
					(snapshot) => { callbacks.progress(50 + 50 * snapshot.bytesTransferred / snapshot.totalBytes); },
					callbacks.error,
					() => {
						aUploadTask.snapshot.ref.getDownloadURL().then(function (aDownloadURL) {
							var newObject = datasetsRef.child("all").push();
							newObject.set({
								dataset: dataset,
								email: email,
								downloadUrl: cDownloadURL,
								annotations_url: aDownloadURL,
								userId: userId,
								filename: cfname,
								allfiles: {
									coords: cfname,
									annotations: afname,
								}
							});
						});
					});
			});
			callbacks.complete();
		}
	);
};

/** takes SMLE file input, uploading to analytics server, creating a database
 * requesting further processing
  */

export const deleteXumiDataset = (dataset_key)=>{

	datasetsRef.child("all_v2").child(dataset_key).remove()
}

export const uploadXumi = (files, meta, callbacks) => dispatch => {

	const { dataset, email, display_name } = meta;
	const userId = userIdFromEmail(email);

	const { base_file, feat_file, segment_base_file, segment_feat_file } = files;
	const bfname = filenameFromMetadata(meta, FILETYPES.XUMI_BASE);
	const ffname = filenameFromMetadata(meta, FILETYPES.XUMI_FEAT);
	const sffname = filenameFromMetadata(meta, FILETYPES.XUMI_SEGMENT_FEAT);
	const sbfname = filenameFromMetadata(meta, FILETYPES.XUMI_SEGMENT_BASE);



	const myItems = [
		{ name: bfname, file: base_file },
		{ name: ffname, file: feat_file },
		{ name: sffname, file: segment_feat_file },
		{ name: sbfname, file: segment_base_file },
	]

	Promise.all(
		// Array of "Promises"
		myItems.map(item => putStorageItem(item))
	)
		.then((items) => {
			
			//console.log("ALL SUCCESS!")
			var newObject = datasetsRef.child("all_v2").push();
			newObject.set({
				dataset: dataset,
				email: email,
				userId: userId,
				display_name:display_name,
				server_process_status: "WAITING",
				server_process_progress: 0,
				allfiles: {
					xumi_feat: ffname,
					xumi_base: bfname,
					xumi_segment_feat:sffname,
					xumi_segment_base:sbfname,
				}
			});
			console.log(newObject)
			callbacks.complete(newObject.key)
		})
		.catch((error) => {
			throw error;
		});

	function putStorageItem(item) {
		// the return value will be a Promise
		var uploadTask = firebase.storage().ref("all_v2/" + item.name).put(item.file)
		uploadTask.then((snapshot) => {
				return {item:item,snapshot:snapshot};
			}).catch((error) => {
				throw error;
			});
		uploadTask.on(
		firebase.storage.TaskEvent.STATE_CHANGED,
		(snapshot) => { callbacks.progress( snapshot.bytesTransferred / snapshot.totalBytes); },
		)
		return uploadTask;
			
	}

	// var uploadTask = storageRef.child(bfname).put(base_file, filetype_meta);
	// var { dataset, email } = meta;
	// const userId = userIdFromEmail(email);
	// var filetype_meta = {
	// 	contentType: 'text/plain',
	// };

	// uploadTask.on(
	// 	firebase.storage.TaskEvent.STATE_CHANGED,
	// 	(snapshot) => { callbacks.progress(50 * snapshot.bytesTransferred / snapshot.totalBytes); },
	// 	callbacks.error,
	// 	() => {

	// 		// Upload completed successfully, now we can get the download URL
	// 		uploadTask.snapshot.ref.getDownloadURL().then(function (/**url*/) {
	// 			var aUploadTask = storageRef.child(bfname).put(data_file, filetype_meta);
	// 			aUploadTask.on(
	// 				firebase.storage.TaskEvent.STATE_CHANGED,
	// 				(snapshot) => { callbacks.progress(50+50* snapshot.bytesTransferred / snapshot.totalBytes); },
	// 				callbacks.error,
	// 				() => {
	// 					aUploadTask.snapshot.ref.getDownloadURL().then(function (/**url*/) {
	// 						var newObject = datasetsRef.child("all_v2").push();
	// 						newObject.set({
	// 							dataset: dataset,
	// 							email: email,
	// 							userId: userId,
	// 							server_process_status:"WAITING",
	// 							server_process_progress:0,
	// 							allfiles: {
	// 								xumi_data:dfname,
	// 								xumi_base:bfname,
	// 							}
	// 						});
	// 					});
	// 				});
	// 		});
	// 		callbacks.complete();
	// 	}
	// );
};

