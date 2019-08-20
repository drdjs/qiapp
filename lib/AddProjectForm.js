import React from 'react';

//import {connect} from 'react-redux'
import './App.css';
import firebase from './firebaseapp';
import 'firebase/auth';
import {UserContext,AdminContext,useAdminUser,useCurrentUser} from './signin'
import 'firebase/firestore';
//
import {Form,Glyphicon} from 'react-bootstrap';
import immutable from 'immutable'


import {FormContainer,SubmitButton,CancelButton,InputGroup,DatepickerGroup,TypeaheadGroup,CheckboxGroup,RadioGroup,mandatory,minLength,emailvalidator} from './formbuilder'


import staffnames from './staffnames'
import taglist from './taglist'


var db = firebase.firestore();

async function getInitialValues(docref,user,isAdmin){
	if (docref){
		var dbDoc=await (isAdmin?db.collection('privprojects').doc(docref).get():db.collection('pubprojects').doc(docref).get())
		console.log(dbDoc)
		if (dbDoc) return dbDoc.data()

		return ({undefined:{leadername:[user.displayName],	propdate:new Date().toISOString()}})	
	}
	return {leadername:[user.displayName],propdate:new Date().toISOString()}
}	

function ProjectInfoForm(props){
	const validators={}
	const [user]=useCurrentUser()
	const [isAdmin]=useAdminUser()
	const [state,setState]=React.useState({initialvalues:undefined})
	const [doc,setDoc]=React.useState(undefined)
	React.useEffect(()=>{
			},[])
	var initialvalues=getInitialValues(props.match.params.doc,user,isAdmin)
	
	const handleClose =()=>{
		props.history.goBack()
	}
		
	const handleSubmit = async function (values){
			for (var k in values){
				if (values[k]===undefined) delete values[k]
			}
		const editref = await db.collection('edits').doc()
		const ref=props.match.params.doc?db.collection('privprojects').doc(props.match.params.doc):db.collection('privprojects').doc(editref.id)
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
		options:taglist,
		label:'Areas covered',
		validation:{test:'length',value:{min:1},message:'Please pick at least one option'}
	},{
		name:'othertags',
		type:'text',
		displayif:{field:'category',test:'includes',value:'other'},
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
		validation:{test:'emaillike'}
	},{
		name:'peopleinvolved',
		type:'typeahead',
		label:'Other people involved',
		multiple:true,
		options:staffnames,
	},{
		type:'radio',	
		options:{"Yes":'Yes',"No":'No'},
		name:'advertise',
		label:'Would you like us to advertise your project to get more people involved?',
		required:true
	},{
		type:'radio',
		options:{'Yes':'Yes', 'No':'No'},
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
				},
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
			},
		name:'research',
		label:'Does this project have R+D approval?',
		help:(<span>(Required if your project is research. <a href="https://www.nhsggc.org.uk/about-us/professional-support-sites/research-development/for-researchers/is-your-project-research/" target="_blank" rel="noopener noreferrer">Is my project research?</a>)</span>),
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
		validation:{test:'value',value:{min:{field:'startdate'}},message:'Finish date must be later than start date'}
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
	
	return (<div>
          <h2>
            Project information
          </h2>
          <div>
			
			<Form horizontal onSubmit={submithandler} >
        <FormContainer
			name='addproject'
			onSubmit={handleSubmit}
			onCancel={handleClose}
			disabled={props.readonly}
			values={initialvalues}
			formdef={formdef}
			submitbutton={<><Glyphicon glyph="ok"/>Save</>}
			cancelbutton={<><Glyphicon glyph="remove"/>Cancel</>}
		/>
		<input type='submit'/>
		
      </Form>
            
      </div>
			<hr/>
          
            
			
          
        </div>

	)
}
function submithandler(e){
	e.preventDefault()
	var formdetails=[]
	for(var i=0;i<e.target.elements.length;i++){
		var el=e.target.elements[i]
		switch (el.type){
			case 'checkbox':
			case 'radio':
				if (el.checked) formdetails.push([el.name,e.value])
				break
			default:
				formdetails.push([el.name,el.value,el.type])
				
	}}
	console.log(formdetails)
}

export default ProjectInfoForm