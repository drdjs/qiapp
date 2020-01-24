import React from 'react';
// eslint-disable-next-line no-unused-vars
import {Col,HelpBlock,FormGroup,ControlLabel,FormControl} from 'react-bootstrap';
// eslint-disable-next-line no-unused-vars
import {Typeahead} from 'react-bootstrap-typeahead'; // ES2015
//import 'react-bootstrap-typeahead/css/Typeahead.css';
//import 'react-datepicker/dist/react-datepicker.css'
import immutable from 'immutable'
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-undef
// eslint-disable-next-line no-unused-vars
import {DateInput} from 'semantic-ui-calendar-react'
import {Form,Message,Table,Grid,Dropdown,Button} from 'semantic-ui-react'
function minLength({length}){
	return (v)=>{
		switch (typeof(v)){
			case 'string':
				if ((v||'').length>=length) return {status:'success'}
				return {status:'error',message:'Must be at least '+length+' characters'}
			case 'object':
				var actuallength=v.length===undefined?v.size===undefined?-1:v.size:v.length
				if (actuallength>=length) return {status:'success'}
				return {
					status:'error',
					message:'You must pick at least '+length+' option'+(length>1?'s':'')+'( '+actuallength+' selected)'}
			default:
				return {status:null}
		}
	}
}

function mandatory(){
		return (v)=>{
		
		if (v!=='' && v!==undefined) return {status:'success'}
		return {status:'error',message:'You need to enter something here'}
		
	
}}

function emailvalidator(){
	return (v)=>{
	if (/.+@.+\..+/.test(v)) return {status:'success'}
	return {status:'error',message:'That is not a valid email address'}
	
}}

const validatorfuncs={minlength:minLength,mandatory,emailvalidator}

//const FormContext=React.createContext()


function FormRow({validstate,display,label,helptext,required,children}){
	var status=null,message=""
	if (validstate!==null) {
		status=validstate.status
		message=validstate.message || ""
	}
	return (
		<Table.Row style={display?{}:{display:'none'}}>
		<Table.Cell><Form.Field required={required} error={status==='error'}>
			<label>{label}</label></Form.Field>
			{helptext?(<Message info>{helptext}</Message>):null}
			</Table.Cell>
		<Table.Cell>
		
		{children}

		{message?(<Message error>{message}</Message>):null}
		</Table.Cell>
		</Table.Row>
	)
}

function makeRadioGroup({disabled,label,name,required,helptext="",options}){	
	return React.memo(({value,refreshvalidation,validstate,display})=>{
	var entries=Object.entries(options)
	console.log('refreshing '+name)
	var status=null,message=""
	if (validstate!==null) {
		status=validstate.status
		message=validstate.message || ""
	}
	var buttons=entries.map((i)=>{
		var val=i[0],label=i[1]
		return ( 
			<Form.Radio 
				disabled={disabled}
				label={label}
				id={name+'_'+val}
				name={name}
				value={val} 
				key={val}
				checked={value===val} 
				onChange={(e,v)=>{if (v.checked){console.log(e,v,val,value);refreshvalidation(name,val)}}} 
				onClick={()=>{refreshvalidation(name,val)}} 
				name={name}
				error={status==='error'}
				/>) 
	})
	return (<FormRow {...{validstate,display,label,helptext,required}}>{buttons}</FormRow>)
})
}
		
function makeCheckboxGroup ({label,required,disabled,name,helptext="",options}){	
	return React.memo(({value,refreshvalidation,validstate,display})=>{
		var entries=Object.entries(options)
		console.log(`refreshing ${name} as ${value} (display:${display})`)
		var buttons= entries.map((i)=>{
		var val=i[0],label=i[1]
		value=value || []
		var status=null,message=""
	if (validstate!==null) {
		status=validstate.status
		message=validstate.message || ""
	}
		return (
			<Form.Checkbox
			disabled={disabled}
			id={name+'_'+val}
			value={val} 
			key={val}
			error={status==='error'}
			checked={value.includes(val)} 
			onChange={(e,v)=>{}} 
			onClick={(e,v)=>{
				if (v.checked) {
					refreshvalidation(name,value.concat([val]))					
				}else{
					refreshvalidation(name,value.filter((v)=>(v!==val)))
					}
				}}
			name={name}
			label={label}/>
		)
		})
		return (
		<FormRow {...{validstate,required,display,label,helptext}}>	
			<Grid stackable columns={2}>
			<Grid.Column>
			{buttons.slice(0,(buttons.length/2+0.5)|0)}
			</Grid.Column>
			<Grid.Column>
			{buttons.slice((buttons.length/2+0.5)|0)}
			</Grid.Column>
			</Grid>
		</FormRow>
		)
		
		})
}
		
function makeTypeaheadGroup ({label,disabled,placeholder,name,helptext="",options,multiple,required,allowNew}){
	return React.memo(({value,refreshvalidation,validstate,display})=>{
		console.log(`refreshing ${name} as ${value} (display:${display})`)
		return(
			<FormRow {...{validstate,display,label,helptext,required}}>

				<Dropdown
				placeholder={placeholder}
				fluid
				multiple
				search
				selection
				options={options}
				disabled={disabled}
				name={name}
				allowAdditions={allowNew||false}
				onChange={(evt,selected) => {
							refreshvalidation(name,selected.value)
							}}
				value={value}
						/>
				{(value||[]).map((v)=><input name={name} type='hidden' value={v}/>)}
			</FormRow>
		)
		})
	}

function makeDatepickerGroup ({label,disabled,name,required,helptext}){
	return React.memo(({value,refreshvalidation,validstate,display})=>{
		console.log(`refreshing ${name} as ${value} (display:${display})`)
		//value= value===undefined ? undefined : value.toISOString ? value.toISOString():value.seconds ? new Date(value.seconds*1000).toISOString():undefined
		return (
			<FormRow {...{validstate,display,label,helptext,required}}>
				<DateInput
						name={name}
						placeholder="Date"
						value={value || ""}
						iconPosition="left"
						onChange={(e,{value})=>{console.log(value);refreshvalidation(name,value)}}
					/>
			</FormRow>
		)
	})}		
		

function makeInputGroup ({componentClass,disabled,label,name,required,type,placeholder,helptext=""}){	
	return React.memo(({value,refreshvalidation,validstate,display})=>{
		console.log(`refreshing ${name} as ${value} (display:${display})`)
		return (
			<FormRow {...{validstate,display,label,helptext,required}}>
				<Form.Input
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e,{value})=>{console.log(value);refreshvalidation(name,value)}}
        />
			</FormRow>
			
		)})
	
	}
	
	function makeTextAreaGroup ({componentClass,disabled,label,name,type,required,placeholder,helptext=""}){	
		return React.memo(({value,refreshvalidation,validstate,display})=>{
			console.log(`refreshing ${name} as ${value} (display:${display})`)
			return (
				<FormRow {...{validstate,display,label,helptext,required}}>
					<Form.TextArea
						name={name}
						placeholder={placeholder}
						value={value}
						onChange={(e,{value})=>{refreshvalidation(name,value)}}
					/>
				</FormRow>
				
			)})
		
		}

function componentmapper (context){
	  return ([name,comp])=>{
		const display=context.display[name]
		const value=context.values[name]
		const displayvalidation=context.displayvalidation
		const validstate=displayvalidation?context.isvalid[name]:null
		const refreshvalidation=context.refreshvalidation
		return React.createElement(comp,{value,refreshvalidation,validstate,display})
}}
function SubmitButton (props){
	////console.log(Object.entries(!props.validity))
	if (props.disabled) return null

return <Button type='submit' onClick={props.onSubmit} {...props.buttondef}/>
}

function CancelButton (props){	
return <Button onClick={props.onClick} disabled={false} {...props.buttondef}/>
}

const DISPLAYVALIDATION=1,REFRESHVALIDATION=2,SETVALUE=3
function validateform(state){
				state.set('forminvalid',false)
				state.get('display').mapKeys((subform)=>{
					let values=state.get('values')
					let displayif=state.get('displayif')
					let isvalid=state.get('isvalid')
					let display=state.get('display')
					let validators=state.get('validators')
					display=display.mergeWith((display,displayif)=>{
						//console.log(
						//	`${displayif.toString()} with ${values.toObject()}: ${displayif(values.toObject())}`);
							return displayif(values.toObject())},displayif)
					isvalid=isvalid.mergeWith(
						(isvalid,validator,key)=>(
							validator.map((val)=>(val(values.get(key),values)))
							.reduce((prev,cur)=>(prev===null?cur:(prev.status==='error'?prev:cur)),null)
						),validators)
					state.set('forminvalid',state.get('forminvalid') || (isvalid.find((v)=>(v!==null && v.status=='error'))))
					state.set('isvalid',isvalid).set('display',display)
			})}
			
			
			
function reducer(oldstate,action){			
	var state=oldstate
	switch (action.type){
		case SETVALUE:
			state=state.setIn(['values',action.field],action.value)
			return state		
		case REFRESHVALIDATION:
			if (action.field) state=state.setIn(['values',action.field],action.value)
			state=state.withMutations(validateform)
			return state
		case DISPLAYVALIDATION:
			state=state.set('displayvalidation',true)
			state=state.withMutations(validateform)
			return state
		default:
			break
	}			
}




const formCache={
	formdef:immutable.OrderedMap(),
	get:function(formname,formdef){
		formdef=immutable.OrderedMap(formdef)
		if (this.formdef.has(formname)) return this.formdef.get(formname)
		var componentinfo=immutable.OrderedMap().set('components',immutable.OrderedMap())
		const componentFromFielddef= (fielddef,fieldname)=>{
			var field=immutable.remove(immutable.remove(fielddef,'displayif'),'type')
			componentinfo=componentinfo.withMutations((compinfo)=>{		
					
				if (fielddef.validators===undefined){fielddef.validators=[]}
				if (fielddef.required===true) fielddef.validators.push('mandatory')
					compinfo.setIn(['validators',fieldname],fielddef.validators.map(
						(v)=>{
							if (typeof(v)==='string') return validatorfuncs[v]()
							return validatorfuncs[v.type](v)
						}))
				
					
				
				
				compinfo.setIn(['displayif',fieldname],fielddef.displayif===undefined? ()=>(true) : fielddef.displayif)
				compinfo.setIn(['isvalid',fieldname],null)
				compinfo.setIn(['values',fieldname],fielddef.defaultvalue)
				compinfo.setIn(['display',fieldname],compinfo.getIn(['displayif',fieldname])({}))
				compinfo.setIn(['valuegetter',fieldname],(s)=>immutable.getIn(s.values,fieldname))
					})
			var newcomponent={
				text:makeInputGroup(field),
				textarea:makeTextAreaGroup(field),
				email: makeInputGroup({type:"email",...field}),
				datepicker: makeDatepickerGroup (field),
				typeahead: makeTypeaheadGroup (field),
				radio: makeRadioGroup(field),
				checkbox: makeCheckboxGroup(field),
				}[fielddef.type]
			if (newcomponent===undefined) {
				console.warn(field)
				throw Error('Unrecognised field type:'+field.type)
			}
			componentinfo=componentinfo.setIn(['components',fieldname],newcomponent)
		
		
		}
		
  	formdef.forEach((f,fname)=>componentFromFielddef(f,fname))
		this.formdef=this.formdef.set(formname,componentinfo)
		return this.formdef.get(formname)
	}
}



async function mapPromises(map){
	var k,v
	var newmap=immutable.Map()
	for ([k,v] of map){
		if (immutable.Map.isMap(v)) newmap=newmap.set(k,await mapPromises(v))
		newmap=newmap.set(k,await Promise.resolve(v))
	}
	return newmap
	
}
function getFormValues(state){
	state=state.withMutations(validateform)	
		var values=state.get('values')
		var valuegetter=state.get('valuegetter')
		var isvalid=state.get('isvalid')
		var display=state.get('display')
		isvalid=isvalid.mergeWith((val,disp)=>(disp?val:null),display)
		values=values.mergeWith((val,valget)=>(valget(val),valuegetter))
		values=values.mergeWith((val,disp)=>(disp?val:undefined),display)
		if(isvalid.flatten().find((v)=>(v!==null && v.status=='error'))) return Promise.reject('forminvalid')
		return mapPromises(values)
	}
	
function FormContainer (props){
	const formdef=formCache.get(props.name,props.formdef)
	const [state,dispatch]=React.useReducer(reducer,immutable.Map({
			values:props.initialvalues||formdef.get('values'),
			display:formdef.get('display'),
			isvalid:formdef.get('isvalid'),
			forminvalid:false,
			displayvalidation:props.displayvalidation,
			displayif:formdef.get('displayif'),
			validators:formdef.get('validators'),
			valuegetter:formdef.get('valuegetter'),
			refreshvalidation:formdef.get('components').map((c,name)=>(v)=>{refreshvalidation(name,v)})
			
		}))
	
	const refreshvalidation=React.useRef(
		(field,value)=>{
			dispatch({type:SETVALUE,field,value});
			Promise.resolve().then(()=>dispatch({type:REFRESHVALIDATION}))}
		).current
	
	const getValues = ()=>(getFormValues(state))

		
	const onSubmit= function(e){		
		getValues()
		.then((submitvalues)=>{console.log('submission values',submitvalues);props.onSubmit(submitvalues.toJS())})
		.catch((e)=>{
			console.log(e)
			dispatch({type:DISPLAYVALIDATION})
		})
	}
		
		const context={refreshvalidation,
				   displayvalidation:state.get('displayvalidation'),
				   dispatch,
				   globalstate:state,
				   subform:undefined,
				   values:state.get('values').toObject(),	
				   display:state.get('display').toObject(),
					 isvalid:state.get('isvalid').toObject(),
					 refs:state.get('refs')}

	return (
		<div>
			<Form
				action={props.action} 
				onSubmit={(e,...rest)=>{
					dispatch({type:DISPLAYVALIDATION});
					e.persist();
					console.log(state.withMutations(validateform).toJS());
					console.log(e);
					for (var i=0;i<rest.length;i++){
						console.log(rest[i])
						}
					}}>
					
					<Table><Table.Body>
						{formdef.get('components').entrySeq().map(componentmapper(context)).toArray()}
						</Table.Body></Table>
		<SubmitButton onSubmit={onSubmit} buttondef={props.submitbutton}/>
		<CancelButton onClick={props.onCancel} buttondef={props.cancelbutton}/>
		<input type='submit'/>
		</Form>
		</div>)
	}




export {SubmitButton,CancelButton,FormContainer,mandatory,minLength,emailvalidator}	
