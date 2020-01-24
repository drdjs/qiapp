import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage'

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCt3Ri-z60wBPpFf0w-ZWlP6gTv9szfwew",
    authDomain: "qiexchange-223621.firebaseapp.com",
    databaseURL: "https://qiexchange-223621.firebaseio.com",
    projectId: "qiexchange-223621",
    storageBucket: "qiexchange-223621.appspot.com",
    messagingSenderId: "53765016271"

};

//firebase.firestore().settings({timestampsInSnapshots: true});

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
export {firebase}