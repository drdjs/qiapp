import React,{useRef,useMemo,useState,useCallback} from 'react';
import toPath from 'lodash/toPath'
import {DateInput} from 'semantic-ui-calendar-react'
import {Form,Message,Table,Grid,Dropdown,Modal,Button} from 'semantic-ui-react'
import invariant from 'invariant'
import {Formik,useFormikContext,Field,FieldArray,useField,ErrorMessage,yupToFormErrors,setIn} from 'formik'
import PropTypes from 'prop-types'
import * as Yup from 'yup'

function useFieldMetainfo(name){
	const formik=useFormikContext()
	const requiredif=React.useContext(DispReqCtx)['req_'+name]
	const displayif=React.useContext(DispReqCtx)['disp_'+name]

	return {
	required: useMemo(()=>requiredif(formik.values,name),[formik.values]),
	visible: useMemo(()=>displayif(formik.values,name),[formik.values]),
	error:formik.errors[name],
	touched:formik.touched[name]
	}
}


function RadioComponent(props){
	return(<BaseCheckboxComponent
		Component={Form.Radio}
		type='radio'
		numCols={1}
		{...props}
		/>)
	}
	
function CheckboxComponent(props){
	return(<BaseCheckboxComponent
		Component={Form.Checkbox}
		type='checkbox'
		numCols={2}
		{...props}
		/>)
}

 function BaseCheckboxComponent({Component,numCols,options,optionsfrom,name,label,helptext,type,...props}){
	options=useMemo(()=>optionsfrom?optionsfrom():options,[options,optionsfrom])
	const [field,meta,helpers]=useField(name)
	const cols=useRef(null)
	const WrappedCheckbox=({value,label})=>{
		const [field,meta,helpers]=useField({name,value,label,type})
		return <Component name={name} value={value} checked={field.checked} onClick={(e,v)=>{field.onChange({target:v})}} label={label}/>
	}
	const makecols=()=>{
		var buttons=options.map(([val,btnlabel])=> <WrappedCheckbox key={val} value={val} label={btnlabel}/>)
		const colLength=Math.ceil(buttons.length/numCols)
		return Array(numCols).fill().map((_,colIndex)=>{
			const startPos=colIndex*colLength
			return(
				<Grid.Column key={colIndex}>
					{buttons.slice(startPos,startPos+colLength)}
				</Grid.Column>
				)
		})}
	if (!cols.current) cols.current=makecols()
	
	return (
		<FormRow name={name} label={label} helptext={helptext}>	
			<Grid stackable columns={numCols}>
				{cols.current}
			</Grid>
		</FormRow>
	)
}
BaseCheckboxComponent.propTypes={
	Component:PropTypes.any,
	numCols:PropTypes.number,
	options:PropTypes.array,
	optionsfrom:PropTypes.func,
}
	
const DropdownMemo=React.memo(Dropdown)
function DropdownComponent({search,optionsfrom,addItemForm,addItem,addItemInitial,label,placeholder,name,helptext,options,multiple,allowNew}){
	const [field,meta,helpers]=useField({name,type:'select',multiple})
	const formik=useFormikContext()
	const _options=options || optionsfrom(formik)
	const onChange=useCallback((e,{value})=>formik.setFieldValue(name,value),[formik.setFieldValue])
	const renderLabel=useCallback(({text,color})=>({content:text,color}),[])
	const [addItemModal,setModalOpen]=useState(false)
	const [addItemValues,setAddItemValues]=useState({})
	const addfunc=React.useRef([()=>{},()=>{}])
		
	return(
		<FormRow helptext={helptext} label={label} name={name}>
			<DropdownMemo
				placeholder={placeholder}
				fluid
				search={search||false}
				selection
				options={_options}
				allowAdditions={allowNew||false}            
				multiple={multiple}
				name={name}
				error={!!meta.error && meta.touched}
				onChange={onChange}
				renderLabel={renderLabel}
				onAddItem={(e,{value})=>{
					setModalOpen(true)
					setAddItemValues(addItemInitial(value))
					return new Promise((res,rej)=>{addfunc.current=[res,rej]})
						.then((val)=>{
							addfunc(val,formik)
							helpers.setValue(multiple?field.value.concat([val.value]):val.value)})
						}}
				value={field.value}
				/>
			{addItemModal?<Modal open={addItemModal}>
				<FormContainer
					formname='adduser'
					onSubmit={(v)=>{setModalOpen(false);addfunc.current[0](v)}}
					onCancel={()=>{setModalOpen(false);addfunc.current[1]()}}
					initialValues={addItemValues}
					formdef={addItemForm}
					enableReinitialize
					>
					{({submitForm,resetForm,values,errors})=>(
						<>
						<Button icon='check' onClick={submitForm}>Save</Button>
						<Button icon="cancel" onClick={resetForm}>Cancel</Button>
						
						</>
					)}
				</FormContainer>
			</Modal>:null}
		</FormRow>
	)
}
function ArrayPopupComponent({label,name,helptext,summary,allowNew,modalForm}){
	const [field,meta,helpers]=useField({name,type:'select'})
	const formik=useFormikContext()
	const [addItemModal,setModalOpen]=useState(false)
	const [addItemValues,setAddItemValues]=useState({})
	const addfunc=React.useRef([()=>{},()=>{}])	
	return(
		<FormRow helptext={helptext} label={label} name={name}>
			<Modal open={addItemModal}>
				<FormContainer
					formname={'modal'+name}
					onSubmit={(v)=>{setModalOpen(false);addfunc.current[0](v)}}
					onCancel={()=>{setModalOpen(false);addfunc.current[1]()}}
					initialValues={addItemValues}
					formdef={modalForm}
					enableReinitialize
					>
					{({submitForm,resetForm,values,errors})=>(
						<>
						<Button icon='check' onClick={submitForm}>Save</Button>
						<Button icon="cancel" onClick={resetForm}>Cancel</Button>
						
						</>
			)}
				</FormContainer>
			</Modal>
			<FieldArray name={name}>
				{(arrayhelpers)=>(
					field.value.map(
					(subfield,index)=>(summary(
						{value:subfield,
						 remove:()=>arrayhelpers.remove(index),
						 popup:()=>{
							 setAddItemValues(subfield)
							 setModalOpen(true)
							 return new Promise((res,rej)=>{addfunc.current=[res,rej]})
							   .then((vals)=>arrayhelpers.replace(index,vals))
						}})
				)))}
			</FieldArray>
		</FormRow>
	)
}
DropdownComponent.propTypes={
	search:PropTypes.bool,
	optionsfrom:PropTypes.func,
	label:PropTypes.string,
	errors:PropTypes.any,
	placeholder:PropTypes.string,
	name:PropTypes.string,
	requiredif:PropTypes.func,
	enabledif:PropTypes.func,
	displayif:PropTypes.func,
	helptext:PropTypes.string,
	options:PropTypes.array,
	multiple:PropTypes.bool,
	allowNew:PropTypes.bool
}

function DatePickerComponent({name,label,helptext}){
	const [field,meta,helpers]=useField(name)
	return (
		<FormRow name={name} label={label} helptext={helptext}>
			<DateInput iconPosition="left" 
			name={name}
			onChange={(e,{value})=>{helpers.setValue(value)}}
			value={field.value}
			/>
		</FormRow>
		)
	}

function InputComponent({name,label,helptext}){
	const [field,meta,helpers]=useField(name)
	return (
		<FormRow name={name} label={label} helptext={helptext}>
			<Form.Input {...field}/>
		</FormRow>
	)
}
		
function TextAreaComponent({name,label,helptext}){
	const [field,meta,helpers]=useField(name)
	return (
		<FormRow name={name} label={label} helptext={helptext}>
			<Form.TextArea {...field}/>
		</FormRow>
)}
function FormRow(props){
	const metaprops=useFieldMetainfo(props.name)
	return <InnerFormRow {...props}{...metaprops}/>
}
const InnerFormRow=React.memo(function ({valid,name,label,helptext,children,required,visible,error,touched}){
		return (
			<Table.Row style={visible?{}:{display:'none'}}>
				<Table.Cell width={8}><Form.Field required={required} error={!!error && touched}>
					<label>{label}</label></Form.Field>
					{helptext?(<Message info>{helptext}</Message>):null}
					<ErrorMessage name={name}>{(msg)=>(<Message error visible>{msg}</Message>)}</ErrorMessage>
				</Table.Cell>
				<Table.Cell width={8}>
					{children}
				</Table.Cell>
			</Table.Row>
		)
	})
FormRow.propTypes={
		valid:PropTypes.bool,
		errors:PropTypes.any,
		display:PropTypes.bool,
		label:PropTypes.string,
		helptext:PropTypes.string,
		required:PropTypes.bool,
		children:PropTypes.any
}

function getDefaultFromFielddef(fielddef){
	if (fielddef.defaultvalue) return fielddef.defaultvalue
	switch (fielddef.type){
		case 'typeahead':
			return fielddef.multiple?[]:''
		case 'checkbox':
			return []
		default:
			return ""
	}
}

function getDefaultValidation(fielddef){
	switch (fielddef.type){
		case 'datepicker':
			return Yup.date('Should be a valid date')
		case 'email':
			return Yup.string().email('Should be a valid email')
		case 'text':
		case 'textarea':
			return Yup.string()
		case 'checkbox':
			return Yup.array()
		case 'typeahead':
			return fielddef.multiple?Yup.array():Yup.string()
		default:
			return Yup.mixed()
		}
}
// from https://stackoverflow.com/questions/57928271/create-yup-nested-object-schema-dynamically
function createYupSchema(formdef){
	const validfuncs={} 
	formdef.forEach((fielddef) =>{
		const fieldname="_." + toPath(fielddef.name).join('.')
		const root=fieldname.substring(0,fieldname.lastIndexOf('.'))
		const leaf=fieldname.substring(fieldname.lastIndexOf('.')+1)
		validfuncs[fieldname] =fielddef.validation || Yup.mixed()
		validfuncs[root]=validfuncs[root] || Yup.object().shape({})
		})
	console.log(validfuncs)
	Object.keys(validfuncs).sort().reverse().forEach(
		(fieldname)=>{
			console.log(fieldname)
			if (fieldname=='_') return
			const root=fieldname.substring(0,fieldname.lastIndexOf('.'))
			const leaf=fieldname.substring(fieldname.lastIndexOf('.')+1)
			validfuncs[root]=validfuncs[root].shape({[leaf]:validfuncs[fieldname]})
			}
	)
	console.log(validfuncs)
	return validfuncs._
};

function makeComponentList(formdef){
	const components=formdef.map( (fielddef)=>{
		var Component={
			text:InputComponent,
			textarea:TextAreaComponent,
			email:InputComponent,
			datepicker:DatePickerComponent,
			typeahead: DropdownComponent,
			radio: RadioComponent,
			checkbox: CheckboxComponent,
			hidden:()=>(null),
			arraypopup: ArrayPopupComponent
			}[fielddef.type]
		invariant(Component,'Unrecognised field type:'+fielddef.type)
		return <Component key={fielddef.name} {...fielddef}/>
		}
		)
	const defaultValues=formdef.reduce((obj,fielddef)=>(setIn(obj,fielddef.name,fielddef.defaultvalue)),{})
	const validationSchema=createYupSchema(formdef)
	const context={}
	formdef.forEach(({name,displayif})=>{context["disp_"+name]=(displayif || (()=>true))})
	formdef.forEach(({name,requiredif,required=false})=>{context["req_"+name]=(requiredif || (()=>required))})
	//console.log(components,defaultValues,validationSchema,context)
	return [components,defaultValues,validationSchema,context]
	}

const DispReqCtx=React.createContext()	
function FormContainer({formdef,initialValues,onSubmit,action,children}){
	const formdefref=useRef(null)
	const getFormDef=()=>{
		if (formdefref.current===null) formdefref.current=makeComponentList(formdef) 
		return formdefref.current
	}
	const [components,defaultValues,validationSchema,contextfxn]=getFormDef()
	return (
		<div>
			<DispReqCtx.Provider value={contextfxn}>
			<Formik initialValues={initialValues || defaultValues} validationSchema={validationSchema} onSubmit={onSubmit}>
			{(formikprops)=>{
			return <Form action={action}	onSubmit={formikprops.onSubmit}	onReset={formikprops.onReset}>		
				<Table selectable><Table.Body>
					{components}
				</Table.Body></Table>
				{children(formikprops)}
			</Form>
			}}
		</Formik>
		</DispReqCtx.Provider>
		</div>)
	}
FormContainer.propTypes={
	formdef:PropTypes.array,
	onSubmit:PropTypes.func,
	action:PropTypes.string,
	children:PropTypes.any}
export default FormContainer	
