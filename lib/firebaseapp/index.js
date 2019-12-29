import getclientfirebase from './client.ifdef'
import getserverfirebase from './server.ifdef'

var [firebase,firebaseapp] = getclientfirebase() || getserverfirebase()

export {firebase,firebaseapp}