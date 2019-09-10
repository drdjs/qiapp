
import React from 'react';
import { firebase } from './firebaseapp';
//eslint-disable-next-line no-unused-vars
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import nookies from 'nookies'
import { useSelector, useDispatch } from 'react-redux'
import {put,takeLatest,delay} from 'redux-saga/effects'
import immutable from 'immutable'



export function signout() {
  firebase.auth().signOut()
}

//eslint-disable-next-line no-unused-vars
function SignInScreen () {
  
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


function userSelector(state) {
  return state.userinfo.get('user')
}
function loginRequiredSelector(state){
  return state.userinfo.get('loginRequired')
}

function setAdminUser(dispatch, isAdmin) {
  dispatch({ type: 'setAdmin', isAdmin })
}

const SET_USER_ACTION = 'setUser'
function setUser(dispatch, user, fromCookie=false) {
  dispatch({ type: SET_USER_ACTION, user, fromCookie })
}



const SET_USER_INFO='setUserInfo'
const SIGNOUT='signoutUser'
const LOGIN_REQUIRED='loginRequired'

export function setUserInfo(dispatch, fields) { dispatch(Object.assign({ type: SET_USER_INFO }, fields)) }
export function signoutUser(dispatch) { dispatch({ type: SIGNOUT }) }
export function setLoginRequired(dispatch,loginRequired){dispatch({type:LOGIN_REQUIRED,loginRequired})}
export async function setUserFromContext(dispatch,ctx){
  if (!ctx || !ctx.req) return
  const idtoken=nookies.get(ctx,'idtoken')
  if (!idtoken) return
  const user=await firebase.auth().verifyIdToken(idtoken)
  setUser(dispatch,user,true)
  }


export function useCurrentUser() {
  const setUserInfo = setUserInfo.bind(null, useDispatch())
  return [useSelector(userSelector),
  setUser.bind(null, useDispatch())
  ]
}
export function useLoginRequired(){
  return [useSelector(loginRequiredSelector),
  setLoginRequired.bind(null,useDispatch())]
}
export function useAdminUser() {
  return [useSelector(userSelector).get('isAdmin'), setAdminUser.bind(null, useDispatch())]
}


//sagas
function* rootSaga(isServer) {
  yield takeLatest(SET_USER_ACTION, setCurrentUser,isServer)
}
function* setCurrentUser(isServer,action) {
  
  const user = action.user
  if (user) {
    try {
      yield setUserInfo(put, { username: user.displayName, uid: user.uid })
      const idTokenResult = yield user.getIdTokenResult()
      yield setAdminUser(put, !!idTokenResult.claims.admin)
      if (isServer) return
      nookies.set(null, 'username', user.displayName)
      nookies.set(null, 'uid', user.uid)
      while (true) {
        const idtoken = yield user.getIdToken()
        yield setUserInfo(put, { idtoken })
        nookies.set(null, 'idtoken', idtoken)
        yield delay(600000, true)
      }
    }
    catch (error) {
      //eslint-disable-next-line no-console
      console.warn(error);
    }
  }
  else {
    signoutUser(put)
    nookies.destroy(null, 'username')
    nookies.destroy(null, 'uid')
    nookies.destroy(null, 'idtoken')
    nookies.destroy(null, 'admin')
  }
}


export function SigninAssistant(props) {
  const [isLoginRequired,setLoginRequired]=useLoginRequired()
  React.useEffect(() => {
    return firebase.auth().onAuthStateChanged(setUser)    
  }, [])//onauthstatechanged returns disconnect function
  if  (isLoginRequired) return <SignInScreen/>
  return props.children
}

function loginreducer(state,action){
  if (state===undefined) state=immutable.Map({user:null,loginRequired:false})
  switch (action.type){
    case SET_USER_INFO:
      return state.mergeIn(['user'],action.user).set('loginRequired',false)
    case LOGIN_REQUIRED:
        return state.get('user')?state:state.set('loginRequired',action.loginRequired)
    case SIGNOUT:
      return state.set('user',null)
  }
  return state
}
export function getLoginModule(isServer){
  return {
    id: 'signin',
    reducerMap: { userinfo:loginreducer },
    sagas: [
        {
            saga: rootSaga,
            argument:[isServer]
        }
    ]
}
}
