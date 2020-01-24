
import React from 'react';
import {firebase} from './firebaseapp';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import Router from 'next/router'
import {useCookies} from 'react-cookie'



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
  const [cookies,setCookie,delCookie]=useCookies(['admin'])

  return [!!cookies.admin,(isAdmin)=>{
    if(isAdmin){
      setCookie('admin','yes')
    }else{
      delCookie('admin')
    }
  }]
}

function useCurrentUser(){
  const [cookies,setCookie,delCookie]=useCookies(['username','uid'])
  return [
    cookies.username?{name:cookies.username,uid:cookies.uid,isAnonymous:false}:{name:'Guest User',uid:null,isAnonymous:true},
    (user)=>{
      if (user){
        setCookie('username',user.displayName)
        setCookie('uid',user.uid)
      }else{
        delCookie('username')
        delCookie('uid')
        delCookie('idtoken')
        delCookie('admin')
      }
    }
  ]
}

function SigninAssistant (props){
  const [currentuser,setUser]=useCurrentUser()
  const [admin,setAdmin]=useAdminUser()
  const [cookies,setCookie,delCookie]=useCookies(['idtoken'])
  React.useEffect(()=>{const unlisten=firebase.auth().onAuthStateChanged(
	(user) => {
    setUser(user===null?anonymoususer:user)
		if (user) {
      user.getIdToken().then(
        (idtoken)=>{
          
          setCookie('idtoken',idtoken,{path:'/',maxAge:3000});
        }
      )
			user.getIdTokenResult()
			.then((idTokenResult) => {
				// Confirm the user is an Admin.
				setAdmin(!!idTokenResult.claims.admin) 
      })
			.catch((error) => {
				console.log(error);
		})	
		}else{
      setUser(null)
      
    }
    const interval=setInterval(()=>{
      const user=firebase.auth().currentUser
      if (user){
        user.getIdToken().then(
          (idtoken)=>{setCookie('idtoken',idtoken,{path:'/',maxAge:3000})}
        )
      }
    },600000)
  return ()=>{clearInterval(interval);unlisten()}
  
  
  })},[])//onauthstatechanged returns disconnect function
  return <UserContext.Provider value={currentuser}><AdminContext.Provider value={admin}>{props.children}</AdminContext.Provider></UserContext.Provider>
  }
  
export {UserContext,AdminContext,SignInScreen,SigninAssistant,signout,useAdminUser,useCurrentUser}