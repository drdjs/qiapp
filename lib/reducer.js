
function reducer(state,action){
	console.log(state,action)
	return {
		currentuser:action.type==='signin'?action.user:state.currentuser,
		}
	}
	
export default reducer