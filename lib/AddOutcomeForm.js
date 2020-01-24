import React from 'react';


import './App.css';
import firebase from './firebaseapp';
import 'firebase/auth';
import 'firebase/firestore';
//
import {Form,Glyphicon,Button} from 'react-bootstrap';
import {UserContext} from './signin'


import {FormContainer} from './formbuilder'


import staffnames from './staffnames'
import { OrderedMap,isImmutable } from 'immutable';



var db = firebase.firestore();

()=>{
	if (props.match.params.doc){
		db.collection('pubprojects').doc(props.match.params.doc).get().then(
			(dbDoc)=>{
				console.log(dbDoc)
				if (!dbDoc) return
				setDoc(dbDoc)
				setState({initialvalues:{nextcyclelead:dbDoc.data().leadername,...dbDoc.data()}})
			}
		)
	}
}

function OutcomeInfoForm (props){
	const validators={}
	const user=React.useContext(UserContext)
	const [state,setState]=React.useState({initialvalues:undefined})
	const [doc,setDoc]=React.useState(undefined)
	
	
	
	const handleClose = ()=>{props.history.goBack()}
	const handleSubmit=(values)=>{
		for (var k in values){
			if (values[k]===undefined) delete values[k]
		}
		if (doc){
			doc.ref.set(values).then(()=>(handleClose()));
		}
	}
	
	const formdef={
		outcome:{
			type:'radio',
			options:{	
				completed:"Project completed",
				interim:"Project continuing (make an interim report)",
				changemethod:"We need to change our project methodology or protocol",
				moretime:"More time required",
				abandoned:"Project abandoned",
				passedon:"Project to be passed on to someone else",
				anothercycle:"Project requires another cycle"
				},
			label:'What was the outcome of your project?',
			validators:['mandatory'],
			},
		whyabandoned:{  
				type:'textarea',
				label:"Why was your project abandoned?",
				placeholder:"Enter description here",
				validators:['mandatory'],
				displayif:(s)=>(s.outcome==='abandoned')
				},
		redodate:{
			type:'datepicker',
			label:"When should the project be repeated?",
			validators:['mandatory'],
			displayif:(s)=>(s.outcome==='anothercycle')
			},
		nextcyclelead:{
			type:'typeahead',		
			multiple:true,
			label:'Who will lead the next cycle?',
			options:staffnames,
			helptext:"Leave blank if you want somebody to volunteer to lead",
			displayif:(s)=>(s.outcome==='anothercycle')
			},
		newstaff:{
			type:'typeahead',
			multiple:true,
			label:'Will anyone else be involved?',
			options:staffnames,
			displayif:(s)=>(s.outcome==='anothercycle')
			},
		nextcyclechanges:{
			type:'radio',		
			label:'Will any changes be made to the methodology of your project?',
			options:{Yes:'Yes',No:'No'},
			displayif:(s)=>(s.outcome==='anothercycle')
			},	
		methodology:{
					type:'textarea',
					label:"What changes will be made to the methodology of your project?",
					placeholder:"Enter description here (eg. change in protocol, data collection method etc)",
					validators:['mandatory'],
					displayif:(s)=>(s.nextcyclechanges==='Yes' || s.outcome==='changemethod')
					},
		caldicott:{
			type:'radio',
			options:{	
				'Yes':'Yes - it has been approved',
				'No':'No - Caldicott approval is not required',
				'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
				'pending':'Caldicott approval is pending'		
				},
			label:'Does this project have Caldicott approval?',
			helptext:'Caldicott approval is required if patient identifiable information is being collected',
			validators:['mandatory'],
			displayif:(s)=>(s.nextcyclechanges==='Yes' || s.outcome==='changemethod')
			},
		research:{
			type:'radio',
			displayif:(s)=>(s.nextcyclechanges==='Yes' || s.outcome==='changemethod'),
			options:{
				'Yes':'Yes - it has been approved',
				'No':'No - R+D approval is not required',
				'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
				'pending':'R+D approval is pending'
				},
			label:'Does this project have R+D approval?',
			help:(<span>(Required if your project is research. <a href="https://www.nhsggc.org.uk/about-us/professional-support-sites/research-development/for-researchers/is-your-project-research/" target="_blank" rel="noopener noreferrer">Is my project research?</a>)</span>),
			validators:['mandatory']
			},
		finishdate:{			
			type:'datepicker',
			label:"When do you anticipate finishing this project?",
			displayif:(s)=>(s.outcome==='moretime'),
			validators:['mandatory'],
			},
		newleadername:{
			displayif:(s)=>(s.outcome==='passedon'),
			type:'typeahead',
			multiple:true,
			label:'Who will be the new project leader(s)',
			options:staffnames,
			helptext:"Leave blank if you want somebody to volunteer to lead",
			},
		newpeopleinvolved:{
			type:'typeahead',
			label:'Other people involved',
			multiple:true,
			options:staffnames,
			displayif:(s)=>(s.outcome==='passedon'),
		},
		changesmade:{
			type:'textarea',
			label:"What changes were made as a result of your project? ",
			placeholder:"Enter description here (eg. guideline developed/evidence of improved patient care/etc)",			
			validators:['mandatory'],
			displayif:(s)=>(s.outcome==='completed' || s.outcome==='interim' || s.outcome==='anothercycle')
			},
		presented:{
			type:'checkbox',
			options:{	
				dept:'Departmental presentation',
				regposter:'Poster presentation at regional conference',
				natposter:'Poster presentation at national conference',
				intlposter:'Poster presentation at international conference',
				regoral:'Oral presentation at regional conference',
				natoral:'Oral presentation at national conference',
				intloral:'Oral presentation at international conference',
				published:'Publication'	
				},
			displayif:(s)=>(s.outcome==='completed' || s.outcome==='interim' || s.outcome==='anothercycle'),
			label:'Has this project been presented or published?',
			},
		pubdetails:{
			type:'textarea',
			label:"Please give details of publications or presentations ",
			placeholder:"Enter description here",
			validators:['mandatory'],
			displayif:(s)=>((s.outcome==='completed' || s.outcome==='interim' || s.outcome==='anothercycle') && s.presented.length>0),
			},
		displayresults:{
			type:'radio',
			options:{	'Yes':'Yes',
						'No':'No',
						'Dontknow':"Maybe"
					},
			displayif:(s)=>(s.outcome==='completed' || s.outcome==='interim' || s.outcome==='anothercycle'),
			label:'Can we display your work in the department?',
			validators:['mandatory'],
		}
	
	return (<div>
          <h2>
            Project outcome
          </h2>
          <div>
		  


            
		<Form horizontal >
        <FormContainer
			name='addoutcome'
			onSubmit={handleSubmit}
			onCancel={handleClose}
			disabled={props.readonly}
			values={state.initialvalues}
			formdef={formdef}
			submitbutton={<><Glyphicon glyph="ok"/>Save</>}
			cancelbutton={<><Glyphicon glyph="remove"/>Cancel</>}
		/>
		
      </Form>
            
          </div>
		  <hr/>
          
            
          
        </div>

	)}



export default OutcomeInfoForm