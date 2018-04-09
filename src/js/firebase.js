import Firebase from 'firebase';
import firebaseConfig from './firebase-config';
let firebase = Firebase.initializeApp(firebaseConfig);
export default firebase;
