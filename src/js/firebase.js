import firebase from 'firebase';
import firebaseConfig from './firebase-config';
let firebaseApp = firebase.initializeApp(firebaseConfig);

export {
    firebaseApp,
    firebase
};
