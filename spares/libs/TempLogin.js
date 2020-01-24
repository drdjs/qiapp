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





class LoginForm extends React.Component{
	constructor(props){
		super(props)
		this.handleSubmit=this.handleSubmit.bind(this)
		
		this.handleClose=this.handleClose.bind(this)
	}
	
	handleClose(){
		this.props.history.goBack()
	}
		
	handleSubmit(values){
		
			
			console.log(values)
			
	}
	
	
	render(){
		
	    //console.log(this.state)
	if (this.props.user) return null	
	return (<div>
          <h2>
            Temporary Login
          </h2>
          <div>
            
			<Form horizontal >
        <FormContainer
			name='login'
			onSubmit={this.handleSubmit}
			onCancel={this.handleClose}
			disabled={this.props.readonly}
			>
			
									
			
				
			<TypeaheadGroup
				name='login'
				multiple={false}
				label='Login as'
				options={staffnames}
				allowNew
				selectHintOnEnter
				
			/>
				
			
			
			<SubmitButton><Glyphicon glyph="ok"/>Save</SubmitButton>
			
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

export default connect((s)=>({user:s.currentuser}),
					  (d)=>({setfield:([field,value])=>{console.log('hello');
							d({
								type:'setvalue',
								formname:'login',
								field,
					  value})}})	)(LoginForm)