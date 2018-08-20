import { datasetsRef } from "../config/firebase";
import _ from "lodash";

export const userIdFromEmail = function(email){
    return email.replace(/[^a-zA-Z0-9]/g,"_");
}


export const datasetToDemo = (email,dataset_key) => {
    const oldRef = datasetsRef.child("all").child(dataset_key);
    oldRef.once('value').then(snap => {
	return oldRef.update({isPublished:true});
    }).then(()=>{
    });
};

export const demoToDataset = (email,dataset_key) => {
    const oldRef = datasetsRef.child("all").child(dataset_key);

    oldRef.once('value').then(snap => {
	return oldRef.update({isPublished:false});
    }).then(()=>{
    });
};


export async function datasetsToAll(email){
    const folderRef =  datasetsRef.child(userIdFromEmail(email));
    const targetFolder = datasetsRef.child("all");
    
    let newRef;
    console.log("logging");
    
    const children = (await folderRef.once('value')).val();
    _.each(children,async function(v,k){
	console.log({k,v});
	newRef = targetFolder.push();
	await newRef.set(v);
	
    });
}



