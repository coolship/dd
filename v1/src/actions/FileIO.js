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
	XUMI_SEGMENT_BASE: "xumi_segment_base",
	FULL_DATA: "full_data.csv",
	FULL_KEY:"full_key.csv",
	FULL_PARAMS:"full_params.csv"
}


function filenameFromMetadata({ email,dataset }, filetype = FILETYPES.DATASET) {

	const email_id = userIdFromEmail(email);
	const file_id = dataset.replace(/[^a-zA-Z0-9]/g, "_");
	const filename = "website_datasets/" + email_id + "/" + (filetype) + "_" + file_id;
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
			datasetsRef.child("all_v2").child(key).remove();
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
						.child("all_v2")
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
						.child("all_v2")
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
							var newObject = datasetsRef.child("all_v2").push();
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

export const deleteXumiDataset = (dataset_key)=> dispatch => {
	datasetsRef.child("all_v2").child(dataset_key).remove()
}

export const uploadFull = (files, meta, callbacks, dataset_key) => dispatch => {

	const { email } = meta;
	const { data_file, key_file, params_file } = files;

	const dataname = filenameFromMetadata(meta, FILETYPES.FULL_DATA)	
	const keyname = filenameFromMetadata(meta, FILETYPES.FULL_KEY)	
	const paramsname = filenameFromMetadata(meta, FILETYPES.FULL_PARAMS)	

	const myItems = [
	{ name: dataname, file: data_file,type:"full_data" },
	{ name: keyname, file: key_file,type:"full_key" },
	{ name: paramsname, file: params_file,type:"full_params" },
	]

	Promise.all(myItems.map(item => putStorageItem(item,callbacks)))
		.then((results) => {
			var fbObject = datasetsRef.child("all_v2").child(dataset_key)
			var allfiles = fbObject.child("allfiles")
			allfiles.update(Object.assign({}, ...results.map(o=>{return {[o.item["type"]]:o["storage_location"]}})))
			callbacks.complete(fbObject.key)
		})
		.catch((error) => {
			throw error;
		});


}

export const uploadXumi = (files, meta, callbacks) => dispatch => {

	const { dataset, email, display_name } = meta;
	const userId = userIdFromEmail(email);

	const { base_file, feat_file, segment_base_file } = files;
	const bfname = filenameFromMetadata(meta, FILETYPES.XUMI_BASE);
	const ffname = filenameFromMetadata(meta, FILETYPES.XUMI_FEAT);
	const sbfname = filenameFromMetadata(meta, FILETYPES.XUMI_SEGMENT_BASE);



	const myItems = [
		{ name: bfname, file: base_file , type:"xumi_base"},
		{ name: ffname, file: feat_file , type:"xumi_feature"},
		{ name: sbfname, file: segment_base_file, type:"xumi_segment" },
	]

	Promise.all(
		// Array of "Promises"
		myItems.map(item => putStorageItem(item,callbacks))
	)
		.then((results) => {
			const allfiles = Object.assign({}, ...results.map(o=>{return {[o.item["type"]]:o["storage_location"]}}))
			var newObject = datasetsRef.child("all_v2").push();
			newObject.set({
				dataset: dataset,
				email: email,
				userId: userId,
				display_name:display_name,
				server_process_status: "WAITING",
				server_process_progress: 0,
				allfiles: allfiles,
				creation_time: new Date().getTime(),
			});
			callbacks.complete(newObject.key)
		})
		.catch((error) => {
			throw error;
		});

};



function putStorageItem(item, callbacks) {
	// the return value will be a Promise
	const storage_location = "all_v2/" + item.name
	console.log(storage_location)
	const type = item.type
	var uploadTask = firebase.storage().ref(storage_location).put(item.file)

	uploadTask.on(
	firebase.storage.TaskEvent.STATE_CHANGED,
	(snapshot) => { callbacks.progress( item.name, snapshot.bytesTransferred / snapshot.totalBytes); },
	)
	return 	uploadTask.then((snapshot) => {
		return {
			item:item,
			snapshot:snapshot,
			storage_location:storage_location,
			download_url:snapshot.ref.getDownloadURL(),
			type:type,
	};
	}).catch((error) => {
		throw error;
	})
		
}