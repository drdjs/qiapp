
import React from 'react';
import {firebase} from './firebaseapp';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Router from 'next/router'
import {useCookies} from 'react-cookie'
import nookies from 'nookies'



function signout(){
  firebase.auth().signOut()
}
const SignInScreen=function (props) {
  const user=React.useContext(UserContext)
  console.log(firebase.auth().EmailAuthProvider)
  const uiConfig = {
    signInFlow: 'redirect',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: (res) => {console.log(res);Router.push('/')}
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

function useCurrentUser(){
  const cookies=nookies.get()
  return [
    cookies.username?{name:cookies.username,uid:cookies.uid,isAnonymous:false}:{name:'Guest User',uid:null,isAnonymous:true},
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
        setUser(user===null?anonymoususer:user)
        if (user) {
          try{
            const idtoken=await user.getIdToken()          
            nookies.set(null,'idtoken',idtoken,{path:'/',maxAge:3000});
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
        nookies.set(null,'idtoken',idtoken,{path:'/',maxAge:3000})}
        }
      },600000)
    return ()=>{clearInterval(interval);unlisten()} 
    }),[])//onauthstatechanged returns disconnect function
  return <UserContext.Provider value={currentuser}><AdminContext.Provider value={admin}>{props.children}</AdminContext.Provider></UserContext.Provider>
  }
  
export {UserContext,AdminContext,SignInScreen,SigninAssistant,signout,useAdminUser,useCurrentUser}
