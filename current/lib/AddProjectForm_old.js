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
import taglist from './taglist'


var db = firebase.firestore();





class ProjectInfoForm extends React.Component{
	constructor(props){
		super(props)
		this.handleSubmit=this.handleSubmit.bind(this)
		this.validators={}
		this.registervalidator=(name,fnc)=>{this.validators[name]=fnc}
		this.handleClose=this.handleClose.bind(this)
		this.state={initialvalues:undefined}
	}
	componentDidMount(){
		if (this.props.match.params.doc){
			db.collection('projects').doc(this.props.match.params.doc).get().then(
				(doc)=>{
					if (!doc) return
					this.doc=doc
					this.setState({initialvalues:(this.databaseToState(doc.data()))})
					
				}
			)
		}else{
			this.setState({initialvalues:{
				leadername:[this.props.user.displayName],
				propdate:new Date().toISOString()
		}})
		}
	}
	databaseToState(values){
		values=Object.assign({},values)
		try{ values.propdate = values.propdate.toISOString()}catch{values.propdate=new Date().toISOString()}
		try{ values.category = values.category.reduce((a,b,c)=>(Object.assign(a,{[b]:true})),{})}catch{values.category={}}
		try{ values.startdate = values.startdate.toISOString() }catch{values.startdate=new Date().toISOString()}
		try{ values.finishdate = values.finishdate.toISOString() }catch{values.finishdate=new Date().toISOString()}
		return values
	}
	stateToDatabase(values){
		values=Object.assign({},values)
		values.propdate = new Date(values.propdate)
		values.category = Object.entries(values.category).map((i)=>(i[1]?i[0]:undefined)).filter((i)=>(!!i))	  
		values.startdate = new Date(values.startdate)
		values.finishdate = new Date(values.finishdate)
		return values
	}
	handleClose(){
		this.props.history.goBack()
	}
		
	handleSubmit(values){
		console.log('values to submit',values)
			
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
	if (this.state.initialvalues===undefined) return <p>Loading...</p>
	return (<div>
          <h2>
            Project information
          </h2>
          <div>
            
			<Form horizontal >
        <FormContainer
			name='addproject'
			onSubmit={this.handleSubmit}
			onCancel={this.handleClose}
			disabled={this.props.readonly}
			values={this.state.initialvalues}
			>
			
			<InputGroup
			  label="Project Title"
			  name='title'
			  componentClass="input"
			  placeholder="Project Title"
			  validator={mandatory}/>
			  
			<TypeaheadGroup
				name='proposername'
				multiple={true}
				label='Name of proposer(s)'
				options={staffnames}
				validator={mandatory}
				
			/>
			  
			<InputGroup
			  label="What are you trying to improve?"
			  name='description'
			  componentClass="textarea"
			  placeholder="Enter description of project here"
			  validator={mandatory}
			  />
			  
			 
			 <RadioGroup
				options={{Yes:'Yes',No:'No'}}
				name='continuous'
				label='Is this an ongoing project?'
				validator={mandatory}
				/>
			
			
			<InputGroup
			  label="Which project?"
			  displayif={(state)=>(state.continuous==='Yes')}
			  name='whichproject'
			  componentClass="textarea"
			  validator={(v,s,f)=>(s.continuous==='Yes' ? mandatory(v,s,f):null)}
			  placeholder="Enter description of project here"
			  />
			  
					
			<DatepickerGroup
				name='propdate'
				label="When was this project proposed?"
				validator={mandatory}
				/>
			
			<InputGroup
			  label="How do you plan to conduct your project?"
			  
			  name='methodology'
			  componentClass="textarea"
			  placeholder="Brief description of methodology eg notes review,survey etc"
			  validator={mandatory}
			  />
			  
			
			<CheckboxGroup
				name='category'
				options={ taglist}
				label='Areas covered'
				validator={minLength(1)}
				/>
			
			<InputGroup
			  displayif={(state)=>state.category_other===true}
			  label="Other areas covered="
			  name='othertags'
			  componentClass="input"
			  placeholder="Other areas covered"
			  validator={(v,s,f)=>{
				  if (!s.category || !s.category.other) return null;
			  return mandatory(v,s,f)}}
			  
			  />
			
						
			<TypeaheadGroup
				name='leadername'
				multiple={true}
				label='Who will lead this project?'
				options={staffnames}
				helptext="Leave blank if you want somebody to volunteer to lead"
				
			/>
			
				
			<InputGroup
			  name="email"
			  label="Contact email address for team:"
			  type="email"
			  placeholder="Contact address"
			  validator={emailvalidator}
			  />
			
			
			<TypeaheadGroup
				name='peopleinvolved'
				label='Other people involved'
				multiple={true}
				options={staffnames}
				/>
			
			<RadioGroup
				options={{	"true":'Yes',
							"false":'No',
				}}
				name='advertise'
				label='Would you like us to advertise your project to get more people involved?'
				validator={mandatory}
				/>
				
			<RadioGroup
				options={{	true:'Yes',
							false:'No'
				}}
				name='mm_or_ci'
				label='Is this project a result of a Morbidity and Mortality or Critical Incident event?'
				validator={mandatory}
				/>
				
			<RadioGroup
				options={{	'Yes':'Yes - it has been approved',
							'No':'No - Caldicott approval is not required',
							'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
							'pending':'Caldicott approval is pending'
							
				}}
				name='caldicott'
				label='Does this project have Caldicott approval?'
				help='Caldicott approval is required if patient identifiable information is being collected'
				validator={mandatory}
				/>	
			<RadioGroup
				options={{	'Yes':'Yes - it has been approved',
							'No':'No - R+D approval is not required',
							'Dontknow':"Don't know - (the QI team will contact you to discuss whether this is needed)",
							'pending':'R+D approval is pending'
							
				}}
				name='research'
				label='Does this project have R+D approval?'
				help={<span>(Required if your project is research. <a href="https://www.nhsggc.org.uk/about-us/professional-support-sites/research-development/for-researchers/is-your-project-research/" target="_blank" rel="noopener noreferrer">Is my project research?</a>)</span>}
				validator={mandatory}
				/>
				
			
			<DatepickerGroup
				name='startdate'
				label="When do you propose to start?"
				validator={mandatory}
				/>
				
			<DatepickerGroup
				name='finishdate'
				label="When do you plan to finish or report on this project?"
				validator={mandatory}
			/>
					
			<RadioGroup
				options={{	'Yes':'Yes',
							'No':'No',
							'NotYet':'Not at this time - maybe later'
				}}
				name='can display'
				label='Are you happy for this project to be displayed on the QI whiteboard and on this website?'
				validator={mandatory}
			/>
			<SubmitButton><Glyphicon glyph="ok"/>Save</SubmitButton>
			<Button alwaysEnable onClick={this.handleClose}><Glyphicon glyph="remove"/>Cancel</Button>
		</FormContainer>
		
      </Form>
            
          </div>
		  <hr/>
          
            
			
          
        </div>

	)}
}

/*




q20 [If q14=Yes then force Yes] Are you happy for us to display brief details of your project on the QI board in the department at QEUH?
Yes
Not at present (choose this option if public knowledge might affect the conduct of your project)
No
*/

export default connect((s)=>({user:s.currentuser}))(ProjectInfoForm)