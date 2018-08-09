import { datasetsRef } from "../config/firebase";

export const userIdFromEmail = function(email){
    return email.replace(/[^a-zA-Z0-9]/g,"_");
}


export const datasetToDemo = (email,dataset_key) => {
    const userId = userIdFromEmail(email);
    const oldRef = datasetsRef.child(userIdFromEmail(email)).child(dataset_key);
    const newRef = datasetsRef.child("demos/datasets/").push();
    oldRef.once('value').then(snap => {
        return newRef.set(snap.val());
    }).then(()=>{
	return oldRef.set(null);
    }).then(()=>{
    });
};

export const demoToDataset = (email,dataset_key) => {
    const userId = userIdFromEmail(email);
    const oldRef = datasetsRef.child("demos/datasets").child(dataset_key);
    const newRef = datasetsRef.child(userIdFromEmail(email)).push();


    oldRef.once('value').then(snap => {
        return newRef.set(snap.val());
    }).then(()=>{
	return oldRef.set(null);
    }).then(()=>{
    });
};
