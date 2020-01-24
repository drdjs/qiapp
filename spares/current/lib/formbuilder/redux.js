import invariant from 'invariant'
import immutable from 'immutable'
import React from 'react'
import {ReactReduxContext,useStore} from 'react-redux'

//Redux mapping functions
function ensureFormRegistered(formname,formdef){
    const store=useStore()
	if (!store.getState().forms){
		store.ensureReducer('forms',formreducer)
	}
	if (!store.getState().forms[formname]){
		store.dispatch(initialiseForm(formname,formdef))
	}
}

function mapStateToProps(state,{formname,name}){
    
    return {
        value:immutable.getIn(state,['forms',formname,'values',name]),
        display:immutable.getIn(state,['forms',formname,'display',name]),
        valid:immutable.getIn(state,['forms',formname,'valid',name]),
        validmessage:immutable.getIn(state,['forms',formname,'validmessage',name]),
        definition:immutable.getIn(state,['forms',formname,'definition'])
    }
}

function makeSingleValueSetter(dispatch,{formname,name}){
    return {setValue:function(value,isSet){
        invariant(isSet===undefined,`Unexpected second argument to makeSingleValueSetter:${isSet}`)
        dispatch({
            type:'setFormValue',
            valueType:'shouldBe',
            formname,name,value})
        dispatch(runValidationAsync(formname))
    }}
}

function makeArrayValueSetter(dispatch,{formname,name}){
    return {setValue:function(value,isSet){
        dispatch({
            type:'setFormValue',
            valueType:isSet?'shouldInclude':'shouldNotInclude',
            formname,name,value
        })
        dispatch(runValidationAsync(formname))
    }}
}

function submitForm(dispatch,props){
	return {submitForm:()=>{
        dispatch({type:'setAllDirty',formname:props.formname})
        dispatch(runValidation(props.formname))}
}}

//redux action creators
function initialiseForm(formname,formdef){
	return (dispatch,getState)=> {
        dispatch({type:'initialiseForm',formname,formdef})
        runValidation(formname)(dispatch,getState)
    }
}


function validationError(message,sender){
    this.name="ValidationError"
    this.message=message
    this.sender=sender
}



function checkTest(criteria,values){
    try{
        _checkTest(criteria,values)
        return true
    }catch(e){
        if (e.name==='ValidationError') return false
        throw e
    }
}
function checkTestWithMessage(criteria,values){
    try{
        _checkTest(criteria,values)
        return [true,undefined]
    }catch(e){
        console.log(e)
        if (e.name==='ValidationError') return [false,e.message]
        throw e
    }
}



function _checkTest(criteria,values){
    const getFieldOrValue = (val)=> (val!==undefined && val.hasOwnProperty('field'))?val.field:val
    //console.log(criteria,values)
    const checkagainst = (value,test)=>{
        invariant(test,'No value specified')
        if (test.hasOwnProperty('min') && value<getFieldOrValue(test.min)) throw new validationError(criteria.message,"min")
        if (test.hasOwnProperty('max') && value>getFieldOrValue(test.max)) throw new validationError(criteria.message),"max"
        if (test.hasOwnProperty('is') && value!==getFieldOrValue(test.is)) throw new validationError(criteria.message,"is")
        return true
    }

    switch (criteria.test){
        case 'notempty':
            invariant(criteria.field,`Field not specified for test:notempty - recieved ${JSON.stringify(criteria)}`)
            if (!values[criteria.field] || values[criteria.field].length===0) throw new validationError(criteria.message,"notempty")
            break
        case 'always':
            return true
        case 'never':
            throw new validationError(criteria.message,"never")
        case 'any':
            invariant(criteria.values,'No values list given for test:any')
            for (let a=0;a<criteria.values.length;a++){
                if (_checkTest(criteria.values[a],values)) return true
            }
            throw new validationError(criteria.message,"notany")
        case 'all':
            invariant(criteria.values,'No values list given for test:all')
            for (let a=0;a<criteria.values.length;a++){
                if (!_checkTest(criteria.values[a],values)) throw new validationError(criteria.message,"all")
            }
            return true
        case 'value':
            return checkagainst(values[criteria.field],criteria.value)
        case 'length':
            return checkagainst(values[criteria.field].length,criteria.value)
            
        
        default:
            //eslint-disable-next-line no-console
            console.warn(`unrecognised test: ${criteria.test}`)
    }
    return true}

function old_testValidationAndDisplay({validators,displayif,values,dirty,validmessage}){
    const display={},valid={}
    //console.log('line 132:',validators,displayif,display,values,dirty)
	for (let a in values){
        //console.log(a,values)
        display[a]=checkTest(displayif[a],values)
        
        if(display[a] && dirty[a]){
            [valid[a],validmessage[a]]=checkTestWithMessage(validators[a],values)
            //console.log(a,valid[a],validmessage[a])
        }else{
            valid[a]=true
            validmessage[a]=""
        }
	}
	return {display,valid,validmessage}
}

function testValidationAndDisplay({functiondef,values,dirty}){
    return Function('values','dirty',functiondef)(values,dirty)
}

function runValidation(formname){
    
	return (dispatch,getState)=>{
        const oldState=getState().forms[formname]
        //console.log(oldState)
		dispatch({type:'setMultipleValidation',formname,validation:testValidationAndDisplay(oldState)})
',validation:'
	}
}

function runValidationAsync(formname){
    return async (d,gS)=>runValidation(formname)(d,gS)
}

function makeValidatorsList(definition){
	const validators={}
	const displayif={}
    const values={}
    const dirty={}
    const validmessage={}
    const variabledefs=[], displayfunc=[]
	definition.forEach((fielddef)=>{
		const fieldvalidators=[]
        variabledefs.push(`$${fielddef.name}=values.${fielddef.name}`)
		if (fielddef.required){
			fieldvalidators.push('expect($this,"Please enter something here").to.not.be.empty()')
		}
		if (fielddef.validation){
			fieldvalidators.push(fielddef.validfunc)
		}
             
        
        displayfunc.push(`
        $this=values.${fielddef.name}
        try{
            ${fielddef.displayfunc || ""};
            display.${fielddef.name}=true
            if(dirty.${fielddef.name}){
            try{
                ${fieldvalidators.join(';')}
                validmessage.${fielddef.name}="";
                valid.${fielddef.name}=true;
            }catch(e){
                validmessage.${fielddef.name}=e;
                valid.${fielddef.name}=false;
                formvalid=false
            }}else{
                valid.${fielddef.name}=undefined;
            }

        }catch(){
            display.${fielddef.name}=false
        }
        `)
        values[fielddef.name]=fielddef.defaultvalue||''
        dirty[fielddef.name]=false
        validmessage[fielddef.name]=""
    })
    const functiondef=`
    const ${variabledefs.join(',')};
    var $this;
    const valid={},validmessage={},display={};
    ${displayfunc.join('\n')}
    return {errors,display,formvalid}
    
    `
	return {validators,validmessage,displayif,values,dirty,functiondef,definition}
}

function checkFormValid(formname){
    const store=React.useContext(ReactReduxContext).store
    return new Promise((res,rej)=>{
        const unsubscribe=store.subscribe((store)=>{
            var valid=Object.entries(immutable.getIn(store.getState(),['forms',formname,'valid'],{}))
            if (valid.some((v)=>v[1]===false)) {  
                unsubscribe()
                rej()
            }
            if (valid.all((v)=>v[1]===true)){ 
                unsubscribe()
                res()
            }
            invariant(valid.all((v)=>v[1]===undefined),`unexpected validity states found:${valid}`)
        })
    })
}

//redux reducers

function formreducer(oldState,action){
     var newState=oldState
	switch (action.type){
		case 'initialiseForm':
			return immutable.set(oldState,action.formname,makeValidatorsList(action.formdef))
		case 'setFormValue':
			switch (action.valueType){
				case 'shouldInclude':
					if ((immutable.getIn(oldState,[action.formname,'values',action.name])||[]).includes(action.value)) return oldState
					newState=immutable.updateIn(oldState,[action.formname,'values',action.name],(oldValue)=>((oldValue||[]).concat([action.value])))
                    break
                case 'shouldNotInclude':
					if (!(immutable.getIn(oldState,[action.formname,'values',action.name])||[]).includes(action.value)) return oldState
					newState=immutable.updateIn(oldState,[action.formname,'values',action.name],(oldValue)=>((oldValue||[]).filter((f)=>(f !== action.value))))
                    break
                case 'shouldBe':
					newState=immutable.setIn(oldState,[action.formname,'values',action.name],action.value)
                    break
                default:
					//eslint-disable-next-line no-console
					console.warn('unexpected valueType for setFormValue action:'+action.valueType)
					return oldState
            }
            newState=immutable.setIn(newState,[action.formname,'dirty',action.name],true)
            return newState
        case 'setAllDirty':
            return immutable.updateIn(oldState,[action.formname,'dirty'],(m)=>{return Object.keys(m).reduce((a,b)=>{a[b]=true;return a},{});return r})		
		case 'setFieldValid':
			return immutable.setIn(oldState,[action.formname,'valid',action.name],{valid:true,message:undefined})
		case 'setFieldInvalid':
			return immutable.setIn(oldState,[action.formname,'valid',action.name],{valid:false,message:action.validmessage})
		case 'setFieldVisible':
			return immutable.setIn(oldState,[action.formname,'display',action.name],true)
		case 'setFieldInvisible':
			return immutable.setIn(oldState,[action.formname,'display',action.name],false)
		case 'setMultipleValidation':
            return immutable.updateIn(oldState,[action.formname], abc => immutable.mergeDeep(abc,action.validation));
		default:
			if (oldState===undefined) return {}
			return oldState	
	}
}
export {ensureFormRegistered,mapStateToProps,makeSingleValueSetter,makeArrayValueSetter,submitForm,initialiseForm,runValidation,formreducer,checkFormValid}
