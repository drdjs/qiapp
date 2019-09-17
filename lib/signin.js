
import React from 'react';
import {firebase} from 'variable/firebaseapp';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Router from 'next/router'
import {useCookies} from 'react-cookie'
import nookies from 'nookies'
import {useSelector,useDispatch} from 'react-redux'


const SIGNOUT_ACTION='signout'

function signout(){
  useDispatch()(
    {type:SIGNOUT_ACTION}
  )
  firebase.auth().signOut()
}

const SignInScreen=function ({next='/'}) {
  const user=React.useContext(UserContext)
  console.log(firebase.auth().EmailAuthProvider)
  const uiConfig = {
    signInFlow: 'redirect',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: (res) => {console.log(res);Router.push(next)}
    }
  };

    
      return (        
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
       
      );
    
}

const anonymoususer={displayName:'Guest',isAnonymous:true,uid:null,getIdTokenResult:()=>(Promise.resolve({claims:{}}))}
const UserContext=React.createContext(anonymoususer)
const AdminContext=React.createContext(false)

function useAdminUser(){
  return [!!nookies.get().admin,(isAdmin)=>{
    if(isAdmin){
      nookies.set(null,'admin','yes')
    }else{
      nookies.destroy(null,'admin')
    }
  }]
}
function userSelector(state){
	return state.userinfo
}

function setAdminUser(dispatch,isAdmin){
	dispatch{type:'setAdmin',isAdmin}
}

function useAdminUser(){
  return [useSelector(userSelector).get('isAdmin'),setAdminUser.bind(null,useDispatch())]
}

function setUserInfo(dispatch,fields) {dispatch(Object.assign({type:'setUserInfo'},fields))}
function signoutUser(dispatch) {dispatch({type:'signoutUser'})}

function useCurrentUser(){
  const setUserInfo=setUserInfo.bind(null,useDispatch())
  return [useSelector(userSelector),
	  (user)=>{
	    if (user){
		setUserInfo({username:user.displayName,uid:user.uid})
	    }else{
		signoutUser(useDispatch())
	    }
	  }]
}

function getCurrentUserFromRequest(ctx){
  const cookies=nookies.get(ctx)
  return cookies.idtoken?admin.auth().verifyIdToken(idToken)
  }
    (user)=>{
      if (user){
        nookies.set(null,'username',user.displayName)
        nookies.set(null,'uid',user.uid)
      }else{
	nookies.destroy(null,'username')
        nookies.destroy(null,'uid')
        nookies.destroy(null,'idtoken')
        nookies.destroy(null,'admin')
      }
    }
  ]
}

function SigninAssistant (props){
  const [currentuser,setUser]=useCurrentUser()
  const [admin,setAdmin]=useAdminUser()
  React.useEffect(()=>{
    const unlisten=firebase.auth().onAuthStateChanged(
      async (user) => {
        setUser(user)
        if (user) {
          try{
            const idtoken=await user.getIdToken()          
            setUser(idtoken)
            const idTokenResult=await user.getIdTokenResult()
            setAdmin(!!idTokenResult.claims.admin) 
            }
	  catch(error){  
  	    console.log(error);
            }	
          }
	else {
          setUser(null)     
        }
      })
    const interval=setInterval(async ()=>{
      const user=firebase.auth().currentUser
      if (user){
        const idtoken=await user.getIdToken()
        setUser(idtoken)
        }
      },600000)
    return ()=>{clearInterval(interval);unlisten()} 
    }),[])//onauthstatechanged returns disconnect function
  return <UserContext.Provider value={currentuser}><AdminContext.Provider value={admin}>{props.children}</AdminContext.Provider></UserContext.Provider>
  }
  
export {UserContext,AdminContext,SignInScreen,SigninAssistant,signout,useAdminUser,useCurrentUser}
