import React from 'react';

import {Col,Radio,HelpBlock,Button,FormGroup,ControlLabel,FormControl,Checkbox} from 'react-bootstrap';
 
 
import {Typeahead} from 'react-bootstrap-typeahead'; // ES2015
import 'react-bootstrap-typeahead/css/Typeahead.css';
import {connect} from 'react-redux'

var DatePicker=require('react-16-bootstrap-date-picker')



function minLength(m){
	return (v,s)=>{
		switch (typeof(v)){
			case 'string':
			
				if ((v||'').length>=m) return 'success'
				return 'error:Must be at least '+m+' characters'
			
			case 'object':
				console.log(Object.entries(v))
				if (Object.entries(v).filter((i)=>(i[1]===true)).length>=m) return 'success'
				return 'error:You must pick at least '+m+' option'+(m>1?'s':'')
			default:
				return null
		}
	}
}

function mandatory(v,s){
		
		if (v!=='' && v!==undefined) return 'success'
		return 'error:You need to enter something here'
		
	
}

function emailvalidator(v,s){
	if (/.+@.+\..+/.test(v)) return 'success'
	return 'error: That is not a valid email address'
	
}


const RadioGroup=connect()(
function ({disabled,label,name,value,helptext="",validstate=null,displayvalidation,refreshvalidation,options,inline,setvalue,allvalues,display}){
	if (!display) return null
	if (!displayvalidation) validstate=null
	if (validstate!==null){
		var errortext
		[validstate,errortext]=validstate.split(':')
		if (errortext) helptext=helptext+errortext
		
	}
			var entries=Object.entries(options)
			var buttons=entries.map((i)=>{
				var val=i[0],label=i[1]
				return (<Radio disabled={disabled} inline={inline} key={val} checked={value===val} onChange={(e)=>{}} onClick={()=>{setvalue(val);refreshvalidation()}} name={name}>{label}</Radio>)
			})
		return (<FormGroup validationState={validstate||null}>
			<Col sm={1}/>
			<Col sm={4}><ControlLabel>{label}</ControlLabel></Col>
			<Col sm={6}>{buttons}<HelpBlock>{helptext}</HelpBlock></Col>
			<Col sm={1}/>
			</FormGroup>)
		}
)		

		
const CheckboxGroup=connect()(
function ({label,disabled,name,helptext="",displayvalidation,value={},validstate=null,options,columns,refreshvalidation,display,setvalue,allvalues}){
	console.log(value)
	if (!display) return null
	if (!displayvalidation) validstate=null
	if (validstate!==null){
		var errortext
		[validstate,errortext]=validstate.split(':')
		if (errortext) helptext=helptext+errortext
	}
			var entries=Object.entries(options)
			var groupstate=Object.assign({},value)
			console.log(groupstate)
			var buttons=entries.map((i)=>{
				var val=i[0],label=i[1]
								
				return (<Checkbox 
					key={val} 
					checked={!!groupstate[val]}
					disabled={disabled}
					onChange={()=>{}}
					onClick={(e)=>{setvalue(Object.assign(groupstate,{[val]:!groupstate[val]}));refreshvalidation()}}
					name={name}>{label}</Checkbox>)
			})
		return (<FormGroup validationState={validstate||null}>
			<Col sm={1}/>
			<Col sm={4}><ControlLabel>{label}</ControlLabel></Col>
			<Col sm={6}>{buttons}<HelpBlock>{helptext}</HelpBlock></Col>
			<Col sm={1}/>
			</FormGroup>)
		})
		
const	TypeaheadGroup = connect()(
function ({label,disabled,name,helptext="",value=[],refreshvalidation,displayvalidation,validstate=null,validator,options,multiple,allowNew,display,setvalue,allvalues}){

	if (!display) return null
	if (!displayvalidation) validstate=null
	if (validstate!==null){
		var errortext
		[validstate,errortext]=validstate.split(':')
		if (errortext) helptext=helptext+errortext
	}	
	return (<FormGroup validationState={validstate||null}>
			<Col sm={1}/>
			<Col sm={4}><ControlLabel>{label}</ControlLabel></Col>
			<Col sm={6}><Typeahead
					disabled={disabled}
					multiple={multiple||false}
					allowNew={allowNew||false}
					onChange={(selected) => {
						console.log(selected)
						setvalue(selected)
						}}
					onBlur={refreshvalidation}
					selected={value}
					options={options}
					/>
					<HelpBlock>{helptext}</HelpBlock>
					</Col>
			<Col sm={1}/>
			</FormGroup>)
		}
		)
		
const DatepickerGroup=connect()(
function ({label,disabled,name,validstate=null,displayvalidation,helptext,value,setvalue,display,allvalues,refreshvalidation}){
	
	if (!display) return null
	if (!displayvalidation) validstate=null	
	if (validstate!==null){
		var errortext
		[validstate,errortext]=validstate.split(':')
		if (errortext) helptext=helptext+errortext
	}	
			return(
				<FormGroup validationState={validstate||null}>
				<Col sm={1}/>
				<Col sm={4}><ControlLabel>{label}</ControlLabel></Col>
				<Col sm={6}><DatePicker disabled={disabled} id={name} value={value} onChange={(c)=>{setvalue(c);refreshvalidation()}} /><HelpBlock>{helptext}</HelpBlock></Col>
			<Col sm={1}/>
				
				
				
				</FormGroup>)}
				)
				
const InputGroup =connect()(
function({componentClass,disabled,label,validstate=null,displayvalidation,display,name,type,placeholder,helptext="",value,setvalue,allvalues,refreshvalidation}){
	
	if (!display) {console.log('invisible');return null}
	if (!displayvalidation) validstate=null
	if (validstate!==null){
		var errortext
		[validstate,errortext]=validstate.split(':')
		if (errortext) helptext=helptext+errortext
	}	
	
	return(<FormGroup validationState={validstate}>
				<Col sm={1}/>
				<Col sm={4}><ControlLabel>{label}</ControlLabel></Col>
				<Col sm={6}>
				<FormControl
					componentClass={componentClass || "input"}
					disabled={disabled}
					value={value||''}
					type={type || 'text'}
					name={name}
					placeholder={placeholder}
					onChange={(e)=>{setvalue(e.target.value)}}
					onBlur={refreshvalidation}
				  />
				<FormControl.Feedback />
				<HelpBlock>{helptext}</HelpBlock></Col>
				<Col sm={1}/>
				
				
				
				</FormGroup>
				
			)})

const SubmitButton=connect()(
function (props){
	console.log(Object.entries(!props.validity))
	if (props.disabled) return null
	
return <Button onClick={props.onSubmit}>{props.children}</Button>
})
			
class FormContainer extends React.Component {
	constructor(props){
		super(props)
		this.fieldmap={	validator:{},
						displayif:{}}
		var values=Object.assign({},props.values)
		var fieldmap=this.fieldmap	
		var display={}
		var isvalid={}
		React.Children.map(this.props.children,(c)=>{
				fieldmap.displayif[c.props.name]=c.props.displayif===undefined? ()=>(true) : c.props.displayif
				fieldmap.validator[c.props.name]=c.props.validator===undefined? ()=>(null) : c.props.validator
				display[c.props.name]=fieldmap.displayif[c.props.name](values)
				isvalid[c.props.name]=null
				})
		//console.log(this.fieldmap)
		this.state={displayvalidation:false,values,display,isvalid}	
		this.setvalue=(field,value)=>{console.log(field,value);this.setState((s)=>({values:Object.assign({},s.values,{[field]:value})}))}
		this.refreshvalidation=()=>{
			var invalid
			this.setState((oldstate)=>{	
			    console.log(this.fieldmap)
				var display=Object.entries(this.fieldmap.displayif)
						.map(([key,displayfunc])=>({[key]:displayfunc(oldstate.values)}))
						.reduce((a,b)=>(Object.assign(a,b)),{})
				var isvalid=Object.entries(this.fieldmap.validator)
						.map(([key,validfunc])=>({[key]:display[key]?validfunc(oldstate.values[key],oldstate.values):null}))
						.reduce((a,b)=>(Object.assign(a,b)),{})
				invalid=Object.entries(isvalid).find(([k,v])=>(!!v && v.indexOf('error')>=0))
				return {display,isvalid,formisvalid:invalid!==undefined}
			
			})
			console.log(invalid)
			return invalid===undefined
		}
		this.onSubmit=()=>{
			
			if (!this.refreshvalidation()){
				console.log('form not valid')
				this.setState({displayvalidation:true})
			}else{
			console.log('form is valid')
			props.onSubmit(this.state.values)}
		}
	}
	
	render(){
		console.log(this.state)
		return (<div>
			{React.Children.map(
				this.props.children,
				(c)=>(React.cloneElement(c,{formname:this.props.name,
				validstate:this.state.isvalid[c.props.name],
				//validstate:this.state.displayvalidation && c.props.validstate,
				value:this.state.values[c.props.name],
				display:this.state.display[c.props.name],
				setvalue:this.setvalue.bind(this,c.props.name),
				refreshvalidation:this.refreshvalidation,
				onSubmit:this.onSubmit,
				disabled:(this.props.disabled && !c.props.alwaysEnable),
				setDisplayValidation:(v)=>{this.setState({displayvalidation:v})}})))}
			</div>)}
}

FormContainer=connect()(FormContainer)	
export {SubmitButton,FormContainer,InputGroup,TypeaheadGroup,DatepickerGroup,CheckboxGroup,RadioGroup,mandatory,minLength,emailvalidator}	
