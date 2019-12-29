
import {useQuery} from '../apollo'
import { CURRENT_USER } from '../../queries';
export {signout,SignInScreen,signin} from './firebase'



export function useCurrentUser(){
  const userdata=useQuery(CURRENT_USER)
  if (userdata.loading) return undefined
  return userdata.data || null
}

export function useLoginRequired(){
  return [false,()=>{}]
}

export function useAdminUser() {
  const currentUser=useCurrentUser()
  return currentUser?currentUser.isAdmin : false
}
 
export function SigninAssistant(props) {
  return props.children
}

