/* eslint-disable no-console */
import React from 'react';
import {firebase} from 'variable/firebaseapp';
import {useCurrentUser,useAdminUser} from '../lib/signin'
import {Icon,Button} from 'semantic-ui-react'
import immutable from 'immutable'
//eslint-disable-next-line no-unused-vars
import {FormContainer,SubmitButton,CancelButton,InputGroup,DatepickerGroup,TypeaheadGroup,CheckboxGroup,RadioGroup,mandatory,minLength,emailvalidator} from '../lib/formbuilder'
import Router,{useRouter} from 'next/router'

import staffnames from '../lib/staffnames'
import taglist from '../lib/taglist'
import * as Yup from 'yup'

console.log('loading addproject')
var db = firebase.firestore();

async function getInitialProps(ctx){

	const user=useCurrentUser(ctx)
	const isAdmin=useAdminUser(ctx)
	const docid=ctx.query.doc
	var dbDoc
	if (docid){
		if (isAdmin){
			dbDoc=await db.collection('privprojects').doc(docid).get()
		}else{
			dbDoc=db.collection('pubprojects').doc(docid).get()
		}
		if (dbDoc) return {initialdata:dbDoc.data()}
	}
	return {initialdata:{leadername:[user.displayName],propdate:new Date().toISOString()}}
}	
const formdef=[
	{	name:'title',
		type:'text',
		label:"Project Title",
		placeholder:"Project Title",
		required:true
	},{
		name:'proposername',
		type:'typeahead',
		multiple:true,
		label:'Name of proposer(s)',
		options:staffnames,
		required:true
	},{			
		name:'description',
		type:'textarea',
		label:"What are you trying to improve?",
		placeholder:"Enter description of project here",
		required:true
	},
	
	{
		name:'propdate',
		type:'datepicker',
		label:"When was this project proposed?",
		required:true
	},{
		name:'methodology',	
		type:'textarea',
		label:"How do you plan to conduct your project?",
		placeholder:"Brief description of methodology eg notes review,survey etc",
		required:true
	},{
		name:'category',
		type:'checkbox',
		options:taglist.values(),
		label:'Areas covered',
		required:true
	},{
		name:'othertags',
		type:'text',
		displayif:((values)=>(values.category.includes && values.category.includes('other'))),
		label:"Other areas covered",
		placeholder:"Other areas covered",
		required:true
	},{
		name:'leadername',
		type:'typeahead',
		multiple:true,
		label:'Who will lead this project?',
		options:staffnames,
		helptext:"Leave blank if you want somebody to volunteer to lead"
	},{
		name:"email",
		type:"email",
		label:"Contact email address for team:",
		placeholder:"Contact address",
		validation:Yup.email('Please enter a valid email address'),
	},{
		name:'peopleinvolved',
		type:'typeahead',
		label:'Other people involved',
		multiple:true,
		options:staffnames,
	},{
		type:'radio',	
		options:[["Yes",'Yes'],["No",'No']],
		name:'advertise',
		label:'Would you like us to advertise your project to get more people involved?',
		required:true
	},{
		type:'radio',
		options:[["Yes",'Yes'],["No",'No']],
		name:'mm_or_ci',
		label:'Is this project a result of a Morbidity and Mortality or Critical Incident event?',
		required:true
	},{
		type:'radio',
		options:{	
				'Yes':'Yes - it has been approved',
				'No':'No - Caldicott approval is not required',
				'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
				'pending':'Caldicott approval is pending'		
				}.entries(),
		name:'caldicott',
		label:'Does this project have Caldicott approval?',
		helptext:'Caldicott approval is required if patient identifiable information is being collected',
		required:true
	},{
		type:'radio',
		options:{
			'Yes':'Yes - it has been approved',
			'No':'No - R+D approval is not required',
			'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
			'pending':'R+D approval is pending'
			}.entries(),
		name:'research',
		label:'Does this project have R+D approval?',
		helptext:(<span>(Required if your project is research. <a href="https://www.nhsggc.org.uk/about-us/professional-support-sites/research-development/for-researchers/is-your-project-research/" target="_blank" rel="noopener noreferrer">Is my project research?</a>)</span>),
		required:true
	},{
		type:'datepicker',
		name:'startdate',
		label:"When do you propose to start?",
		required:true
	},{
		type:'datepicker',
		name:'finishdate',
		label:"When do you plan to finish or report on this project?",
		required:true,
		validation:Yup.date().min(Yup.ref('startdate'),'Finish date must be later than start date'),
	},{
		name:'candisplay',
		type:'radio',
		options:{'Yes':'Yes',
			'No':'No',
			'NotYet':'Not at this time - maybe later'
				},
		label:'Are you happy for this project to be displayed on the QI whiteboard and on this website?',
		required:true
	}
	]

function ProjectInfoForm({initialdata,readonly,docid}){
	const [user]=useCurrentUser()
	const [isAdmin]=useAdminUser()
	
	React.useEffect(()=>{
			},[])
	var initialvalues=initialdata
	
	const handleClose =()=>{
		useRouter().push('/')
	}
	
	async function handleSubmit(){handleClose()}

	const _handleSubmit = async function (values){
			for (var k in values){
				if (values[k]===undefined) delete values[k]
			}
		const editref = await db.collection('edits').doc()
		const ref=Router.query.doc?db.collection('privprojects').doc(Router.query.doc):db.collection('privprojects').doc(editref.id)
		const publicref=db.collection('pubprojects').doc(ref.id)
		var pubvalues=immutable.set(values,'email','******@******')
		if (isAdmin) {
			values.commit=true
			pubvalues.commit=true
		if (values.candisplay==='Yes'){
			await publicref.set(pubvalues)
		}else{
			publicref.delete()
		}
		await ref.set(values)
		await ref.update(
			{edits:firebase.firestore.FieldValue.arrayUnion(editref),
			timestamp:firebase.firestore.FieldValue.serverTimestamp()})
		await editref.set(values)
		await editref.update({projectref:ref,timestamp:firebase.firestore.FieldValue.serverTimestamp()})
		handleClose();		
		}
	}
	
	
	
	

	

	return (<div>
          <h2>
            Project information
          </h2>
          <div>
			
			
        <FormContainer
			formname='addproject'
			onSubmit={handleSubmit}
			onCancel={handleClose}
			disabled={readonly}
			initialValues={initialvalues}
			formdef={formdef}
			>
		{(submitForm,resetForm)=>(
			<>
			<Button icon='check' onClick={submitForm}>Save</Button>
			<Button icon="cancel" onClick={resetForm}>Cancel</Button>
			</>
		)}
			</FormContainer>
		
    
	
            
          </div>
		<hr/>
          
            
			
          
        </div>

	)
}

ProjectInfoForm.getInitialProps=getInitialProps
//export default (props)=>(<div/>)
export default ProjectInfoForm