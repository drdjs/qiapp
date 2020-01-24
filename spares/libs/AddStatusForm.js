import React from "react";
import firebase from "./firebaseapp";
import {Glyphicon,Button} from 'react-bootstrap';

import InputField from './InputField'


 
class AddStatusForm extends React.Component{
	constructor(props){
		super(props)
		this.handleSubmit=this.handleSubmit.bind(this)
		this.state={title:'',description:'',show:false,
		avatar: "",
		isUploading: false,
		progress: 0,
		avatarURL: ""}
		
		this.handleTitleChange=this.handleChange.bind(this,'title')
		this.handleDescChange=this.handleChange.bind(this,'description')
		this.handleClose=this.handleClose.bind(this)
		this.handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });
		this.handleProgress = progress => this.setState({ progress });
		
	}
	componentDidMount(){
		this.setState({show:this.props.show})
	}
	handleChange(param,e) {
		var newstate={}
		newstate[param]=e.target.value
		this.setState(newstate);
	}
	
	handleClose(){
		this.props.history.goBack()
	}
		
	handleSubmit(evt){
		var self=this
		if (Math.min(self.state.title.length,self.state.description.length)>0){
			console.log(firebase.auth().currentUser)
			
			
		
			var docref= firebase.firestore().collection('projects').doc(self.props.match.params.doc)
						
				firebase.firestore().runTransaction(async function (txn){
					var doc = await txn.get(docref)
					try{
						var statuses=doc.data().statuses||[]
						
						statuses.push({title:self.state.title,description:self.state.description,posted:new Date(),authorname:firebase.auth().currentUser.displayName,authoruid:firebase.auth().currentUser.uid})
						
						await txn.update(docref,{statuses:statuses})
						
					}catch(e){
						console.log('transaction failed: '+e)
					}
				})
				.then(()=>{self.handleClose()})
				
				return
		}
		
			
		if (evt){evt.preventDefault()}
	}
	
	
	render(){
	return (<div>
          <h2>
            Add a status update
          </h2>
          <div>
            
			<form onSubmit={this.handleSubmit}>
        <InputField
          controlId="formTitle"
          label="Title"
          componentClass="input"
          placeholder="Title"
		  value={this.state.title}
		  validator={()=>(this.state.title.length>1 ? 'success':'error')}
		  onChange={this.handleTitleChange}
          />
		  
		<InputField
          controlId="formDescription"
          label="Description"
          componentClass="textarea"
          placeholder="Enter description here"
		  value={this.state.description}
		  validator={()=>(this.state.description.length>0 ? 'success':'error')}
		  onChange={this.handleDescChange}
          />
		  
          
          
		
      </form>
            
          </div>
		  <hr/>
          
            <Button onClick={this.handleSubmit}><Glyphicon glyph="pencil"/>Save</Button>
			<Button onClick={this.handleClose}><Glyphicon glyph="remove"/>Cancel</Button>
			
          
        </div>

	)}
}
 
export default AddStatusForm;