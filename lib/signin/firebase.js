
import React from 'react';
import {firebase} from '../firebaseapp'
//eslint-disable-next-line no-unused-vars
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';






export function signout() {
  firebase.auth().signOut()
}

//eslint-disable-next-line no-unused-vars
export function SignInScreen () {
  
  const uiConfig = {
    signInFlow: 'redirect',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => {}
    }
  };


  return (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />

  );

}

export function signin(){}
export async function isUserAdmin(user){
	const idTokenResult = await user.getIdTokenResult()
    return !!idTokenResult.claims.admin
}
export function getIdToken(user){
	return user.getIdToken()
}
export function getUserFromToken(idtoken){return firebase.auth().verifyIdToken(idtoken)}
export function onChangeUser(handler){return firebase.auth().onAuthStateChanged(handler)}    
