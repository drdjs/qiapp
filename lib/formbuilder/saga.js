import {debounce,select,put,takeLatest,call} from 'redux-saga/effects'
import {buildValidator} from './fieldvalidators'
import {SET_FORM_VALUE,SUBMIT_FORM ,setMultipleValidation} from './actions'


export function* validationSaga(formname,formdef){
	const validator=buildValidator(formdef)
	const selector=(state)=>state.getIn([formname,'values']).toJS()
	const validateinput = function* (){
		const validation=validator(yield select(selector))
		yield setMultipleValidation(put,validation)
		return validation
	}
	const submitform = function* (action){		
		const validation=yield call(validateinput)
		if (validation.get('errors').valueSeq().flatten().first()===undefined){
			try{
				yield call(action.onSubmit,yield select(selector))
				if(action.onSubmitted) {yield call(action.onSubmitted)}
			}catch(err){
				if(action.onSubmitError){yield call(action.onSubmitError)}
			}
		}
	}
	
	yield debounce(500,(action)=>(action.type==SET_FORM_VALUE && action.formname==formname),validateinput)
	yield takeLatest((action)=>(action.type==SUBMIT_FORM && action.formname==formname),submitform)
}