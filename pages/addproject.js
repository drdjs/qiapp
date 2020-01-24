/* eslint-disable no-console */
import React from 'react';
import {firebase} from '../lib/firebaseapp';
import {useCurrentUser,useAdminUser} from '../lib/signin'
import {Icon,Button,Label} from 'semantic-ui-react'
import immutable from 'immutable'
//eslint-disable-next-line no-unused-vars
import FormContainer from '../lib/formbuilder'

import Router,{useRouter} from 'next/router'

import staffnames from '../lib/staffnames'
import taglist from '../lib/taglist'
import * as Yup from 'yup'

console.log('loading addproject')
var db = firebase.firestore();


const StaffContext=React.createContext()
const DispatchContext=React.createContext()
const makeAddProjectForm=(vars)=>{
	const addUserForm=makeAddUserForm(vars)
	return [
	{	name:'title',
		type:'text',
		label:"Project Title",
		placeholder:"Project Title",
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		name:'people.proposer',
		type:'typeahead',
		multiple:true,
		label:'Name of proposer(s)',
		optionsfrom:({values})=>staffnames.concat(values.people.added),
		addItemForm:makeAddUserForm(vars),
		addItem:(item,{values,setFieldValue})=>setFieldValue('people.added',values.people.added.concat([item])),
		addItemInitial:(val)=>({text:val,value:val,grade:""}),
		required:true,
		validation:Yup.array().required().min(1),
		defaultvalue:[]
	},{
		name:'people.added',
		type:'arraypopup',
		modalForm:addUserForm,
		label:'Register these people as users:',
		summary:({popup,remove,value})=><div> <Button size='mini' icon='pencil' onClick={popup}/><Button size='mini' icon='user delete' onClick={remove}/>
			{{MS:<Label color='gray'>{value.text} (Med st)</Label>,
			 AA:<Label color='purple'>{value.text} (AA)</Label>,
			 NS:<Label color='blue'>{value.text} (Nurse)</Label>,
			 FY:<Label color='blue'>{value.text} (FY1/2)</Label>,
			 CT:<Label color='green'>{value.text}(CT1/2)</Label>,
			 ACCS:<Label color='green'>{value.text}(ACCS)</Label>,
			 Inter:<Label color='orange'>{value.text}(ST3/4)</Label>,
			 Higher:<Label color='red'>{value.text}(ST5/7)</Label>,
			 SAS:<Label color='gray'>{value.text}(SAS)</Label>,
			 Con:<Label color='black'>{value.text}(Cons)</Label>,
			 Oth:<Label color='white'>{value.text}(Other)</Label>}[value.grade]} </div>,
		defaultvalue:[],
		displayif:(values)=>(values.people.added.length>0)
	},{
		name:'description',
		type:'textarea',
		label:"What are you trying to improve?",
		placeholder:"Enter description of project here",
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
		
	},{
		name:'propdate',
		type:'datepicker',
		label:"When was this project proposed?",
		required:true,
		validation:Yup.date().required(),
		defaultvalue:""
	},{
		name:'methodology',	
		type:'textarea',
		label:"How do you plan to conduct your project?",
		placeholder:"Brief description of methodology eg notes review,survey etc",
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		name:'category',
		type:'checkbox',
		options:(Object.entries(taglist)),
		label:'Areas covered',
		required:true,
		validation:Yup.array().required(),
		defaultvalue:[]
	},{
		name:'othertags',
		type:'text',
		displayif:((values)=>(values?.category?.includes?.('other'))),
		label:"Other areas covered",
		placeholder:"Other areas covered",
		required:true,
		validation:Yup.string().required().when('category',(category,sch)=>(category.includes('other') ? sch:sch.strip())),
		defaultvalue:""
	},{
		name:'people.leader',
		type:'typeahead',
		multiple:true,
		label:'Who will lead this project?',
		optionsfrom:({values})=>staffnames.concat(values.people.added),
		addItemForm:addUserForm,
		addItem:(item,{values,setFieldValue})=>setFieldValue('people.added',values.people.added.concat([item])),
		addItemInitial:(val)=>({text:val,value:val,grade:""}),
		search:true,
		allowNew:true,
		helptext:"Leave blank if you want somebody to volunteer to lead",
		defaultvalue:[]
	},{
		name:"email",
		type:"email",
		label:"Contact email address for team:",
		placeholder:"Contact address",
		validation:Yup.string().email('Please enter a valid email address'),
		defaultvalue:""
	},{
		name:'people.involved',
		type:'typeahead',
		label:'Other people involved',
		multiple:true,
		search:true,
		allowNew:true,
		optionsfrom:({values})=>staffnames.concat(values.people.added),
		addItemForm:addUserForm,
		addItem:(item,{values,setFieldValue})=>setFieldValue('people.added',values.people.added.concat([item])),
		addItemInitial:(val)=>({text:val,value:val,grade:""}),
		defaultvalue:[]
	},{
		type:'radio',	
		options:[["Yes",'Yes'],["No",'No']],
		name:'advertise',
		label:'Would you like us to advertise your project to get more people involved?',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		type:'radio',
		options:[["Yes",'Yes'],["No",'No']],
		name:'mm_or_ci',
		label:'Is this project a result of a Morbidity and Mortality or Critical Incident event?',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		type:'radio',
		options:Object.entries({	
				'Yes':'Yes - it has been approved',
				'No':'No - Caldicott approval is not required',
				'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
				'pending':'Caldicott approval is pending'		
				}),
		name:'caldicott',
		label:'Does this project have Caldicott approval?',
		helptext:'Caldicott approval is required if patient identifiable information is being collected',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		type:'radio',
		options:Object.entries({
			'Yes':'Yes - it has been approved',
			'No':'No - R+D approval is not required',
			'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
			'pending':'R+D approval is pending'
			}),
		name:'research',
		label:'Does this project have R+D approval?',
		helptext:(<span>(Required if your project is research. <a href="https://www.nhsggc.org.uk/about-us/professional-support-sites/research-development/for-researchers/is-your-project-research/" target="_blank" rel="noopener noreferrer">Is my project research?</a>)</span>),
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{
		type:'datepicker',
		name:'startdate',
		label:"When do you propose to start?",
		required:true,
		validation:Yup.date().required(),
		defaultvalue:""
	},{
		type:'datepicker',
		name:'finishdate',
		label:"When do you plan to finish or report on this project?",
		required:true,
		validation:Yup.date().required().min(Yup.ref('startdate'),'Finish date must be later than start date'),
		defaultvalue:""
	},{
		name:'candisplay',
		type:'radio',
		options:Object.entries({'Yes':'Yes',
			'No':'No',
			'NotYet':'Not at this time - maybe later'
				}),
		label:'Are you happy for this project to be displayed on the QI whiteboard and on this website?',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	}
]}
const makeAddUserForm=(vars)=>([
	{	name:'text',
		type:'text',
		label:'Full name',
		placeholder:'Name',
		required:true,
		validation:Yup.string().required(),
		defaultvalue:""
	},{	
		name:'value',
		type:'hidden',
		defaultvalue:""
	},{
		name:'grade',
		type:'radio',
		label:'Job role',
		options:Object.entries(
			{MS:'Medical student',
			 AA:'Anaesthesia Associate',
			 NS:'Nurse',
			 FY:'FY1/FY2',
			 CT:'CT1-2',
			 ACCS:'ACCS',
			 Inter:'ST3-4',
			 Higher:'ST5-7',
			 SAS:'Staff grade',
			 Con:'Consultant',
			 Oth:'Other'}),
		validation:Yup.string().required(),
		defaultvalue:""
	}
		 ])

function ProjectInfoForm(){
	const user=useCurrentUser()
	const isAdmin=useAdminUser()
	
	var initialvalues=undefined
	
	const handleClose =()=>{
		useRouter().push('/')
	}
	
	async function handleSubmit(){handleClose()}
	const [currentstaffnames,dispatch]=React.useReducer((names,action)=>{return names.concat([{text:action.name.name,value:action.name.value}])},staffnames)
	const vars=React.useRef({})
	const formdef=makeAddProjectForm(vars)
	vars.current.additem=((item)=>dispatch({name:item}))
	
	return (<div>
          <h2>
            Project information
          </h2>
          <div>
			
		<StaffContext.Provider value={currentstaffnames}>
		<DispatchContext.Provider value={dispatch}>
        <FormContainer
			formname='addproject'
			onSubmit={handleSubmit}
			onCancel={handleClose}
			initialValues={initialvalues}
			formdef={formdef}
			>
		{({submitForm,resetForm,values,errors})=>(
			<>
			<Button icon='check' onClick={submitForm}>Save</Button>
			<Button icon="cancel" onClick={resetForm}>Cancel</Button>
			</>
		)}
			</FormContainer>
			</DispatchContext.Provider>
			</StaffContext.Provider>
			
		
    
	
            
          </div>
		<hr/>
          
            
			
          
        </div>

	)
}

export default ProjectInfoForm