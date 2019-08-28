import React,{useRef} from 'react';
import {connect,ReactReduxContext} from 'react-redux' 
// eslint-disable-next-line no-unused-vars
import {Col,HelpBlock,FormGroup,ControlLabel,FormControl} from 'react-bootstrap';
import invariant from 'invariant'
//import 'react-datepicker/dist/react-datepicker.css'
import {DateInput} from 'semantic-ui-calendar-react'
import {Form,Message,Table,Grid,Dropdown,Button} from 'semantic-ui-react'

import {getFormModule,mapStateToProps,makeSingleValueSetter,makeArrayValueSetter,submitForm,initialiseForm,runValidation,formreducer} from './redux'
import components from './components';
//eslint-disable-next-line no-unused-vars
import {DynamicModuleLoader} from 'redux-dynamic-modules'

const RadioComponent=connect(mapStateToProps,makeSingleValueSetter)(components.RadioComponent)
const CheckboxComponent=connect (mapStateToProps,makeArrayValueSetter)(components.CheckboxComponent)
const DropdownComponent=connect(mapStateToProps,makeSingleValueSetter)(components.DropdownComponent)
const DatePickerComponent=connect(mapStateToProps,makeSingleValueSetter)(components.DatePickerComponent)
const InputComponent=connect(mapStateToProps,makeSingleValueSetter)(components.InputComponent)
const TextAreaComponent=connect(mapStateToProps,makeSingleValueSetter)(components.TextAreaComponent)

function SubmitButton(props){
	if (props.disabled) return null
	return <Button type='submit' onClick={props.onClick} {...props.buttondef}/>
}


function CancelButton (props){	
return <Button onClick={props.onClick} disabled={false} {...props.buttondef}/>
}

function makeComponentList(formdef,formname){
	console.log(`generating form definition ${formdef.length}`)
		return formdef.map( (fielddef)=>{
			//eslint-disable-next-line no-unused-vars
			var field=(({displayfunc,validfunc,type,...rest})=>({formname,...rest}))(fielddef)
			var newcomponent={
				text:React.createElement(InputComponent,field),
				textarea:React.createElement(TextAreaComponent,field),
				email: React.createElement(InputComponent,{type:"email",...field}),
				datepicker: React.createElement(DatePickerComponent,field),
				typeahead: React.createElement(DropdownComponent ,field),
				radio: React.createElement(RadioComponent,field),
				checkbox: React.createElement(CheckboxComponent,field),
				}[fielddef.type]
			invariant(newcomponent,'Unrecognised field type:'+field.type)
			return newcomponent
		}
  	)
	}

const FormContainer = connect(mapStateToProps,submitForm)(	
function (props){
		const makeMandC=()=>({
			module:getFormModule(props.formname,props.formdef),
			def:makeComponentList(props.formdef,props.formname)
			}
			)
	const moduleAndComponents=useRef(null)
	const formModule=()=>{
		if (moduleAndComponents.current===null) moduleAndComponents.current=makeMandC()
		return moduleAndComponents.current.module
	}
	
	const componentList=()=>{
		if (moduleAndComponents.current===null) moduleAndComponents.current=makeMandC()
		return moduleAndComponents.current.def
	}
	
	return (
		<div>
		<DynamicModuleLoader modules={[formModule()]}>
			<Form
				action={props.action} 
				onSubmit={props.submitForm}>
					
					<Table selectable><Table.Body>
						{componentList()}
						</Table.Body></Table>
		<SubmitButton onClick={props.submitForm} buttondef={props.submitbutton}/>
		<CancelButton onClick={props.onCancel} buttondef={props.cancelbutton}/>
		</Form>
		</DynamicModuleLoader>
		</div>)
	}
)
export {SubmitButton,CancelButton,FormContainer}	
