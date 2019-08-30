import firebase from "firebase-admin"
import serviceAccount from "../credentials.json"
firebase.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://qiexchange-223621.firebaseio.com"
});

export default firebase
