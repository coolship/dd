import * as firebase from "firebase";

import { FirebaseConfig } from "../config/keys";


firebase.initializeApp(FirebaseConfig);

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp()


const storage = firebase.storage();
export const storageRef = storage.ref();
export const datasetTestRef = storageRef.child('927c.json');
export const datasetsStorageRef = storageRef.child('datasetsStorageRef');

const databaseRef = firebase.database().ref();
export const todosRef = databaseRef.child("todos");
export const datasetsRef = databaseRef.child("datasets");
export const umiMetasRef = databaseRef.child("umimetas");
export const typesMetasRef = databaseRef.child("typesmetas");
export const usersRef = databaseRef.child("users");
export const authRef = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider();


