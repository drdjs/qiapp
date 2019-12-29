import React,{useRef,useMemo} from 'react';
import {DateInput} from 'semantic-ui-calendar-react'
import {Form,Message,Table,Grid,Dropdown} from 'semantic-ui-react'
import invariant from 'invariant'
import {Formik,useFormikContext,useField,ErrorMessage,yupToFormErrors} from 'formik'
import PropTypes from 'prop-types'
import * as Yup from 'yup'

function useFieldInfo({name,type,enabledif,required,requiredif,displayif,label,helptext}){
	const formik=useFormikContext()
	const field=useField({name,type})[0]
	const disabled=enabledif?formik.isSubmitting||useMemo(()=>(!enabledif(formik.values,name),[formik.values])):false
	const _required=requiredif?useMemo(()=>requiredif(formik.values,name),[formik.values]):required
	const visible=displayif?useMemo(()=>displayif(formik.values,name),[formik.values]):true
	const valid=!field[1].error
	return [
		{label,	helptext, required:_required,valid,visible},
		{disabled,valid,onChange:field[0].onChange,onBlur:field[0].onBlur}
	]
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
    
function BaseCheckboxComponent({
	Component,
	numCols,
	options,optionsfrom,
	...props
	}){
		options=useMemo(()=>optionsfrom?optionsfrom():options,[options,optionsfrom])
		var buttons=options.map(([val,label])=>{
			const fieldProps=useFieldInfo(props)[1]
            return ( 
                <Component 
                    label={label}
                    id={name+'_'+val}
                    key={val}
                    {...fieldProps} 
                    />) 
        })
		const rowProps=useFieldInfo(props)[0]
        const colLength=Math.ceil(buttons.length/numCols)
            var cols=Array(numCols).fill().map((_,colIndex)=>{
                const startPos=colIndex*colLength
                return(
                    <Grid.Column key={colIndex}>
                        {buttons.slice(startPos,startPos+colLength)}
                    </Grid.Column>
                )
            })
        return (
            <FormRow {...{rowProps}}>	
                <Grid stackable columns={numCols}>
                {cols}
                </Grid>
            </FormRow>
            )
        
	}
BaseCheckboxComponent.propTypes={
	Component:PropTypes.any,
	numCols:PropTypes.int,
	options:PropTypes.array,
	optionsfrom:PropTypes.func,
}
    
function DropdownComponent({search,optionsfrom,label,placeholder,name,requiredif,enabledif,displayif,helptext,options,multiple,allowNew}){
        const fieldinfo=useFieldInfo({name,type:'select',multiple,enabledif,requiredif,displayif})
        return(
            <FormRow helptext={helptext} label={label} {...fieldinfo}>
    
                <Dropdown
                placeholder={placeholder}
                fluid
                search={search}
                selection
                options={optionsfrom?optionsfrom():options}
                allowAdditions={allowNew||false}
                
				multiple={fieldinfo.multiple}
                disabled={fieldinfo.disabled}
				name={name}
				error={!!fieldinfo.error}
                onChange={fieldinfo.onChange}
                value={fieldinfo.value}
                        />
                {((typeof fieldinfo.value==='string'?[fieldinfo.value]:fieldinfo.value)||[]).map((v,i)=><input key={i} name={name} type='hidden' value={v}/>)}
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
function DatePickerComponent(props){
        const [rowProps,fieldProps]=useFieldInfo(props)
		return (
                <FormRow {...rowProps}>
                    <DateInput iconPosition="left" {...fieldProps}/>
                </FormRow>
            )
		}

            
function InputComponent(props){
		const [rowProps,fieldProps]=useFieldInfo(props)
        return (
            <FormRow {...rowProps}>
                <Form.Input {...fieldProps}/>
            </FormRow>
            
            )
        }
        
function TextAreaComponent(props){
       const [rowProps,fieldProps]=useFieldInfo(props)
        return (
            <FormRow {...rowProps}>
                <Form.TextArea {...fieldProps}/>
            </FormRow>
            
        )}

function FormRow({valid,display,label,helptext,required,children}){
            return (
                <Table.Row style={display?{}:{display:'none'}}>
                <Table.Cell width={8}><Form.Field required={required} error={!valid}>
                    <label>{label}</label></Form.Field>
                    {helptext?(<Message info>{helptext}</Message>):null}
                    <ErrorMessage name={name}>{(msg)=>(<Message error visible>{msg}</Message>)}</ErrorMessage>
                    </Table.Cell>
                <Table.Cell width={8}>
                {children}
                </Table.Cell>
                </Table.Row>
            )
		}
FormRow.propTypes={
		valid:PropTypes.bool,
		errors:PropTypes.any,
		display:PropTypes.bool,
		label:PropTypes.string,
		helptext:PropTypes.string,
		required:PropTypes.bool,
		children:PropTypes.any
}



function makeComponentList(formdef){
		return [formdef.map( (fielddef)=>{
			var Component={
				text:InputComponent,
				textarea:TextAreaComponent,
				email:InputComponent,
				datepicker:DatePickerComponent,
				typeahead: DropdownComponent,
				radio: RadioComponent,
				checkbox: CheckboxComponent,
				}[fielddef.type]
			invariant(Component,'Unrecognised field type:'+fielddef.type)
			return <Component key={fielddef.name} {...fielddef}/>
			}
		),
			formdef.map((fielddef)=>(fielddef.defaultvalue||"")),
			Yup.object().shape(formdef.map((fielddef)=>(fielddef.validation?
				[fielddef.name,fielddef.validation.when([`$req_${fielddef.name}`,`$disp_${fielddef.name}`],(req,disp,sch)=>(req&&disp?sch.required():sch.notRequired()))]:null))
			.reduce(
				(p,c)=>(c?Object.assign(p,{[c[0]]:c[1]}):p,
				{}))),
		formdef.map(({name,requiredif,required=false})=>(["req_"+name,requiredif?requiredif:()=>required])),
		formdef.map(({name,displayif})=>(["disp_"+name,displayif?displayif:()=>true]))
		]
	}

	
function FormContainer({formdef,initialValues,onSubmit,action,children}){
	const formdefref=useRef(null)
	const getFormDef=()=>{
		if (formdefref.current===null) formdefref.current=makeComponentList(formdef) 
		return formdefref.current.def
	}
	const [components,defaultValues,validationSchema,requiredFuncs,displayFuncs]=getFormDef()
	const validator=(values) => {
		const context = {};
		requiredFuncs.forEach(([key,func])=>{context[key]=func(values)})
		displayFuncs.forEach(([key,func])=>{context[key]=func(values)})
	
		return validationSchema
			.validate(values, { abortEarly: false, context })
			.catch(err => {
			throw yupToFormErrors(err);
		});
	  }
	return (
		<div>
			<Formik initialValues={initialValues || defaultValues} validator={validator} onSubmit={onSubmit}>
			{(formikprops)=>
			<Form action={action}	onSubmit={formikprops.onSubmit}	onReset={formikprops.onReset}>		
				<Table selectable><Table.Body>
					{components}
				</Table.Body></Table>
				{children(useFormikContext())}
			</Form>
			}
		</Formik>
		</div>)
	}
FormContainer.propTypes={
	formdef:PropTypes.array,
	onSubmit:PropTypes.func,
	action:PropTypes.string,
	children:PropTypes.any}
export default FormContainer	
