
import React from 'react';

var wsConnection

function getConnection(){
    const promiseFunc=(resolve)=>{
        if (wsConnection){
            resolve(wsConnection)
            return
        }
        wsConnection=new WebSocket('ws://localhost:9000')
        wsConnection.addEventListener('open', ()=> {resolve(wsConnection)},{once:true})
        wsConnection.addEventListener('close',()=>{wsConnection=undefined})    
    }
    return new Promise(promiseFunc)
    }

export function onChangeUser(handler){
    const handlerfunc=(evt)=>{
        const parsedEvt=JSON.parse(evt.data)
        if (parsedEvt.type==="userChange"){handler(parsedEvt.user)}
    }
    getConnection().then((ws)=>ws.addEventListener('message',handlerfunc))
    return ()=>getConnection().then((ws)=>ws.removeEventListener('message',handlerfunc))
}    


export async function signout() {
    const ws=await getConnection()
    ws.send(JSON.stringify({type:'signOut'}))
    }


export async function signin(credential){
    const ws=await getConnection()
    ws.send(JSON.stringify({type:'signIn', credential}))
}

export async function isUserAdmin(user){
	return user.isAdmin
}

export async function getIdToken(){return 'dummytoken'}
export async function getUserFromToken(){return null}  //not implemented on server side


const formdef=[
	{
		name:"email",
		type:"email",
		label:"Contact email address for team:",
		placeholder:"Contact address",
		validation:{test:'emaillike'},
		validfunc:'expect(field().isEmail(),"Please enter a valid email address")'
	},{	
        name:'Password',
        type:'text',
        label:"Password",
        placeholder:"",
        required:true
    }
	]

function SignInScreen(){

	return (<div>
          <h2>
            Sign In
          </h2>
          <div>
			
			
        <FormContainer
			formname='signinform'
			onSubmit={signin}
			onCancel={()=>{}}
			
			formdef={formdef}
			submitbutton={{icon:"check",content:"Save"}}
			cancelbutton={{icon:"cancel",content:"Cancel"}}
		/>
		
    
	
            
          </div>
		<hr/>
          
            
			
          
        </div>

	)
}

ProjectInfoForm.getInitialProps=getInitialProps
//export default (props)=>(<div/>)
export default ProjectInfoForm