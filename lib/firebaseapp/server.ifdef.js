///#if isServer
import firebase from "firebase-admin"
import serviceAccount from "../../../qiapp.json"


export default ()=>{
  console.log('serverside')
  const config={
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://qiexchange-223621.firebaseio.com"
  };
  return [!firebase.apps.length ? firebase.initializeApp(config) : firebase.app(),firebase]}

///#else
	export default ()=>undefined
///#endif
