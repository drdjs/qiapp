import invariant from 'invariant'
import immutable from 'immutable'
import React from 'react'
import {ReactReduxContext,useStore} from 'react-redux'
import actions from './actions'./actions

//Redux mapping functions


function mapStateToProps(state,{formname,name}){
    
    return {
        value:state.getIn([formname,'values',name]),
        display:state.getIn([formname,'display',name]),
        dirty:state.getIn([formname,'dirty',name]),
        valid:state.getIn([formname,'dirty',name])?(
            state.getIn([formname,'errors',name],[]).size===0
        ):(undefined),
        errors:immutable.getIn(state,['forms',formname,'errors',name])       
    }
}

function makeSingleValueSetter(dispatch,{formname,name}){
    return {
        setValue:function(value,isSet){
            invariant(isSet===undefined,`Unexpected second argument to makeSingleValueSetter:${isSet}`)
            actions.valueShouldBe(dispatch,formname,name,value)
            },
        setDirty:actions.setDirty.bind(null,dispatch,formname,name)
    }
}

function makeArrayValueSetter(dispatch,{formname,name}){
    return {
        setValue:function(value,isSet){
            return isSet?actions.shouldInclude(dispatch,formname,name,value):actions.shouldNotInclude(dispatch,formname,name,value)
        },
        setDirty:actions.setDirty.bind(null,dispatch,formname,name)
    }
}


function submitForm(dispatch,{formname,onSubmit,onSubmitted,onSubmitError}){
	return {submitForm:()=>{
        
        actions.setAllDirty(dispatch,formname)
        actions.submitForm(dispatch,formname,onSubmit)
        }
}}


export {
    mapStateToProps,makeSingleValueSetter,
    makeArrayValueSetter,submitForm}
