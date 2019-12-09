
import React from 'react';
//eslint-disable-next-line no-unused-vars
import nookies from 'nookies'
import { useSelector, useDispatch, useStore } from 'react-redux'
import {put,takeLatest,delay} from 'redux-saga/effects'
import immutable from 'immutable'
import {signout,SigninScreen,onChangeUser,getUserFromToken,getIdToken,signin,isUserAdmin} from './firebase'


function userSelector(state) {
  console.log(state)
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
export function setLoginRequired(dispatch,test){dispatch({type:LOGIN_REQUIRED,test})}
export function requireLogin(dispatch){
  setLoginRequired(dispatch,(user)=>(!user))
}
export function allowAnonymous(dispatch){
  setLoginRequired(dispatch,()=>(false))
}
export function requireAdmin(dispatch){
  setLoginRequired(dispatch,(user)=>(!user.isAdmin))
}
export function useRequireLogin(){requireLogin(useDispatch())}
export function useAllowAnonymous(){allowAnonymous(useDispatch())}
export function useRequireAdmin(){requireAdmin(useDispatch())}

export async function setUserFromContext(dispatch,ctx){
  if (!ctx || !ctx.req) return
  const {idtoken}=nookies.get(ctx)
  if (!idtoken) return
  console.log(idtoken)
  const user=await getUserFromToken(idtoken)
  setUser(dispatch,user,true)
  }


export function useCurrentUser(store=useStore()) {
  
  return [userSelector(store.getState()),
  setUser.bind(null, store.dispatch)
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
      
	  yield setAdminUser(put, isUserAdmin(user))
      if (isServer) return
      while (true) {
        const idtoken = yield getIdToken(user)
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
    nookies.destroy(null, 'idtoken')
  }
}


export function SigninAssistant(props) {
  const [isLoginRequired]=useLoginRequired()
  React.useEffect(() => {
    return onChangeUser(setUser)    
  }, [])//onauthstatechanged returns disconnect function
  if  (isLoginRequired) return <SignInScreen/>
  return props.children
}

function loginreducer(state,action){
  if (state===undefined) {
    state=immutable.Map({user:immutable.Map({isAnonymous:true}),loginRequired:false,loginRequiredTest:()=>false})
    state.serialize=(s)=>(
      s.update('loginRequiredTest',(t)=>t.toString())
      .set('deserialize',((state)=>(immutable.fromJS(state).update('loginRequiredTest',(t)=>eval(t)))).toString())
      .toJS())
    }
  switch (action.type){
    case SET_USER_INFO:
      return state
        .mergeIn(['user'],action.user)
        .setIn(['user','isAnonymous',false])
        .set('loginRequired',state.get('loginRequiredTest')(state.get('user')))
    case LOGIN_REQUIRED:
        return state.set(['loginRequiredTest'],action.test)
    case SIGNOUT:
      return state.set('user',immutable.Map({isAnonymous:true}))
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
