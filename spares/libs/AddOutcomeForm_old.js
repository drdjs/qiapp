import React from 'react';

import {connect} from 'react-redux'
import './App.css';
import firebase from './firebaseapp';
import 'firebase/auth';
import 'firebase/firestore';
//
import {Form,Glyphicon,Button} from 'react-bootstrap';



import {FormContainer,SubmitButton,InputGroup,DatepickerGroup,TypeaheadGroup,CheckboxGroup,RadioGroup,mandatory,minLength,emailvalidator} from './formbuilder'


import staffnames from './staffnames'



var db = firebase.firestore();





class ProjectInfoForm extends React.Component{
	constructor(props){
		super(props)
		this.handleSubmit=this.handleSubmit.bind(this)
		if (this.props.match.params.doc){
			db.collection('projects').doc(this.props.match.params.doc).get().then(
				(doc)=>{
					if (!doc) return
					this.doc=doc
					props.setfield(['nextcyclelead',doc.data().leadername])
					Object.entries(this.databaseToState(doc.data())).forEach(props.setfield)
					
				}
			)
		}else{
			Object.entries({
				leadername:[props.user.displayName],
				propdate:new Date().toISOString()
			}).forEach(props.setfield)
		}
		
		
		this.validators={}
		this.registervalidator=(name,fnc)=>{this.validators[name]=fnc}
		this.handleClose=this.handleClose.bind(this)
	}
	databaseToState(values){
		values=Object.assign({},values)
		try{ values.propdate = values.propdate.toISOString()}catch{values.propdate=new Date().toISOString()}
		try{ values.category = values.category.reduce((a,b,c)=>(Object.assign(a,{[b]:true})),{})}catch{values.category={}}
		try{ values.redodate = values.redodate.toISOString() }catch{values.redodate=new Date().toISOString()}
		try{ values.finishdate = values.finishdate.toISOString() }catch{values.finishdate=new Date().toISOString()}
		return values
	}
	stateToDatabase(values){
		values=Object.assign({},values)
		values.propdate = new Date(values.propdate)
		values.category = Object.entries(values.category).map((i)=>(i[1]?i[0]:undefined)).filter((i)=>(!!i))	  
		values.startdate = new Date(values.startdate)
		values.redodate = new Date(values.redodate)
		values.finishdate = new Date(values.finishdate)
		return values
	}
	handleClose(){
		this.props.history.goBack()
	}
		
	handleSubmit(values){
		
			
			for (var k in values){
				if (values[k]===undefined) delete values[k]
			}
			values=this.stateToDatabase(values)
		if (this.doc){
			this.doc.ref.set(values).then(()=>(this.handleClose()));
		}else{			  				
			db.collection('projects').add(values).then(()=>(this.handleClose()));
			
		}
	}
	
	
	render(){
		
	    //console.log(this.state)
		
	return (<div>
          <h2>
            Project outcome
          </h2>
          <div>
		  


            
		<Form horizontal >
        <FormContainer
			name='addproject'
			onSubmit={this.handleSubmit}
			onCancel={this.handleClose}
			disabled={this.props.readonly}
			>
			<RadioGroup
				options={{	completed:"Project completed",
							moretime:"More time required",
							abandoned:"Project abandoned",
							passedon:"Project to be passed on to someone else",
							anothercycle:"Project requires another cycle"
				}}
				name='outcome'
				label='What was the outcome of your project?'
				validator={mandatory}
				/>
			
			  
			<InputGroup
			  label="Why was your project abandoned?"
			  name='whyabandoned'
			  componentClass="textarea"
			  placeholder="Enter description here"
			  displayif={(s)=>(s.outcome==='abandoned')}
			  validator={(v,s,f)=>(s.outcome==='abandoned' ? mandatory(v,s,f):null)}
			  />
			  
			 			
			<DatepickerGroup
				name='redodate'
				label="When should the project be repeated?"
				displayif={(s)=>(s.outcome==='anothercycle')}
			    validator={(v,s,f)=>(s.outcome==='anothercycle' ? mandatory(v,s,f):null)}
				/>
				
			<TypeaheadGroup
				name='nextcyclelead'
				multiple={true}
				label='Who will lead the next cycle?'
				displayif={(s)=>(s.outcome==='anothercycle')}
				options={staffnames}
				helptext="Leave blank if you want somebody to volunteer to lead"
				
			/>
				
			<DatepickerGroup
				name='finishdate'
				label="When do you anticipate finishing this project?"
				displayif={(s)=>(s.outcome==='moretime')}
			    validator={(v,s,f)=>(s.outcome==='moretime' ? mandatory(v,s,f):null)}
				/>
			
			<TypeaheadGroup
				name='newstaff'
				multiple={true}
				label='Will anyone else be involved?'
				displayif={(s)=>(s.outcome==='anothercycle')}
				options={staffnames}
				helptext="Leave blank if you want somebody to volunteer to lead"
				
			/>
			
			<TypeaheadGroup
				name='leadername'
				multiple={true}
				label='Who will be the new project leader(s)'
				displayif={(s)=>(s.outcome==='passedon')}
				options={staffnames}
				helptext="Leave blank if you want somebody to volunteer to lead"
				
			/>
			
						
			<TypeaheadGroup
				name='peopleinvolved'
				displayif={(s)=>(s.outcome==='passedon')}
				label='Other people involved'
				multiple={true}
				options={staffnames}
				/>
			
			<InputGroup
			  label="What changes were made as a result of your project? "
			  name='changesmade'
			  componentClass="textarea"
			  placeholder="Enter description here (eg. guideline developed/evidence of improved patient care/etc)"
			  displayif={(s)=>(s.outcome==='completed')}
			  validator={(v,s,f)=>(s.outcome==='completed' ? mandatory(v,s,f):null)}
			  />
			
			<CheckboxGroup
				options={{	dept:'Departmental presentation',
							regposter:'Poster presentation at regional conference',
							natposter:'Poster presentation at national conference',
							intlposter:'Poster presentation at international conference',
							regoral:'Oral presentation at regional conference',
							natoral:'Oral presentation at national conference',
							intloral:'Oral presentation at international conference',
							published:'Publication'	
				}}
				name='presented'
				label='Has this project been presented or published?'
				displayif={(s)=>(s.outcome==='completed')}
				
				/>
			<InputGroup
			  label="Please give details of publications or presentations "
			  displayif={(s)=>(s.outcome==='completed')}
			  name='pubdetails'
			  componentClass="textarea"
			  placeholder="Enter description here"
			  validator={(v,s,f)=>(s.outcome==='completed' ? mandatory(v,s,f):null)}
			  />
			  
			<RadioGroup
				options={{	'Yes':'Yes',
							'No':'No',
							'Dontknow':"Maybe"
							
				}}
				name='displayresults'
				label='Can we display your work in the department?'
				displayif={(s)=>(s.outcome==='completed')}
				validator={(v,s,f)=>(s.outcome==='completed' ? mandatory(v,s,f):null)}
				/>	
			<SubmitButton><Glyphicon glyph="ok"/>Save</SubmitButton>
			<Button alwaysEnable onClick={this.handleClose}><Glyphicon glyph="remove"/>Cancel</Button>
		</FormContainer>
		
      </Form>
            
          </div>
		  <hr/>
          
            
s          
        </div>

	)}
}




export default connect((s)=>({user:s.currentuser}),
					  (d)=>({setfield:([field,value])=>{console.log('hello');
							if (value===undefined) return
							d({
								type:'setvalue',
								formname:'addproject',
								field,
					  value})}})	)(ProjectInfoForm)