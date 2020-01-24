import React from "react";
import firebase from "./firebaseapp";
import {Label,Glyphicon,Button,FormGroup,ControlLabel,FormControl} from 'react-bootstrap';

import InputField from './InputField'


 
class FileUploadForm extends React.Component{
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
		this.addFile=(event)=>{
			var file=event.target.files[0]
			this.setState({upload:file,filename:file.name})}
		this.handleUploadError = error => {
			this.setState({ isUploading: false });
			console.error(error);
		  };
		this.handleUploadSuccess = filename => {
			this.setState({ avatar: filename, progress: 100, isUploading: false });
			console.log('saved as'+filename)
			var docref= firebase.firestore().collection('projects').doc(this.props.match.params.doc)
			async function trans(txn){
				var doc = await txn.get(docref)
				try{
					var files=doc.data().files||[]
					var url = await firebase.storage().ref("uploads").child(filename).getDownloadURL()
					
					files.push({filename:this.state.username,blobname:filename,url:url})
					await txn.update(docref,{files:files})
					
				}catch(e){
					console.log('transaction failed: '+e)
				}
			}
			firebase.firestore().runTransaction(trans.bind(this))
			
		  };
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
		if (Math.min(self.state.title.length,self.state.description.length)>0 && self.state.upload){
			console.log(firebase.auth().currentUser)
			var randomfilename=Date.now().toString(36)
			var storageRef = firebase.storage().ref().child(randomfilename).child(self.state.upload.name)
			var docref= firebase.firestore().collection('projects').doc(self.props.match.params.doc)
			var uploadTask = storageRef.put(self.state.upload);

			uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
			  function(snapshot) {
				var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				self.setState({progress:progress})
				
			  }, 
			  function(error) {
				switch (error.code) {
				case 'storage/unauthorized':
				  break;

				case 'storage/canceled':
				  break;
				  
				case 'storage/unknown':
				  break;
				  default:
				  break;
			  }
			}, function() {
				
				firebase.firestore().runTransaction(async function (txn){
					var doc = await txn.get(docref)
					try{
						var files=doc.data().files||[]
						var url = await storageRef.getDownloadURL()
						
						files.push({filename:self.state.title,description:self.state.description,blobname:randomfilename,url:url})
						console.log(docref)
						console.log(files)
						await txn.update(docref,{files:files})
						
					}catch(e){
						console.log('transaction failed: '+e)
					}
				})
				.then(()=>{self.handleClose()})
				})
				return
	
		}
			
		if (evt){evt.preventDefault()}
	}
	
	
	render(){
	return (<div>
          <h2>
            Add a new file
          </h2>
          <div>
            
			<form onSubmit={this.handleSubmit}>
        <InputField
          controlId="formTitle"
          label="Filename"
          componentClass="input"
          placeholder="Display name"
		  value={this.state.title}
		  validator={()=>(this.state.title.length>1 ? 'success':'error')}
		  onChange={this.handleTitleChange}
          />
		  
		<InputField
          controlId="formDescription"
          label="Short description"
          componentClass="textarea"
          placeholder="Enter description of file here"
		  value={this.state.description}
		  validator={()=>(this.state.description.length>0 ? 'success':'error')}
		  onChange={this.handleDescChange}
          />
		  {this.state.isUploading && <p>Progress: {this.state.progress}</p>}
          {this.state.avatarURL && <a href={this.state.avatarURL}>Download</a>}
		  <FormGroup>
			<ControlLabel htmlFor="fileUpload" style={{ cursor: "pointer" }}><h3><Label bsStyle="success">Add file</Label></h3>
			<FormControl
            id="fileUpload"
            type="file"
            accept="*"
            onChange={this.addFile}
            style={{ display: "none" }}
            />
			{this.state.filename}
            </ControlLabel>
</FormGroup>
          
          
		
      </form>
            
          </div>
		  <hr/>
          
            <Button onClick={this.handleSubmit}><Glyphicon glyph="ok"/>Save</Button>
			<Button onClick={this.handleClose}><Glyphicon glyph="remove"/>Cancel</Button>
			
          
        </div>

	)}
}
 
export default FileUploadForm;