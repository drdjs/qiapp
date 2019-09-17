import firebase from "firebase-admin"
import serviceAccount from "../../credentials/qiapp.json"
const config={
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://qiexchange-223621.firebaseio.com"
};

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();
export {firebase}
