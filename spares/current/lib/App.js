//import 'babel-polyfill'; 

import React from 'react';
import {HashRouter as Router, Route, Link, Redirect} from 'react-router-dom'

import './App.css';
import firebase from './firebaseapp';
//import firebaseui from 'firebaseui'
import {Col,Label,Panel,Modal,ListGroup,ListGroupItem,PanelGroup,Navbar,Nav,NavItem,Glyphicon,Button} from 'react-bootstrap';
//import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

import AddProjectForm from './AddProjectForm'
import AddOutcomeForm from './AddOutcomeForm'
import InputField from './InputField'
import FileUploader from './FileUploader'
import {UserContext,AdminContext,SignInScreen,SigninAssistant} from './signin'
import AddStatus from './AddStatusForm'

import taglist from './taglist'

const db = firebase.firestore();


function DatabaseRow (props) {
    		
	const [modalOpen,setModalOpen]=React.useState(false)
	const [proposername,setproposername] = React.useState('...')
	const [title,settitle]= React.useState('...')
	const [description,setdescription] = React.useState('...')
	const [leadername,setleadername] =React.useState([])
	const [peopleinvolved,setpeopleinvolved]= React.useState([])
	const [category,setcategory]=React.useState([])
	const isAdmin=React.useContext(AdminContext)
	
    React.useEffect(()=>{
		stateSetter(props.doc)
		return props.doc.ref.onSnapshot(stateSetter)
	})
	
	const stateSetter = (doc)=>{
		
		setproposername((doc.data().proposername || []).join(','))
		setleadername((doc.data().leadername || []))
		setpeopleinvolved((doc.data().peopleinvolved || []))
		settitle(doc.data().title)
		setdescription(doc.data().description)
		setcategory(doc.data().category)	
	}
			
	const handleHide = ()=>{setModalOpen(false)}
			
	var doc=props.doc;
	var values=Object.assign({},doc.data())
	const currentuser=React.useContext(UserContext)
		
	function makehref(user){
		return <Link key={user.uid} to={"/message/"+user.uid}>{user.realname}{user.role === 'lead' ? '(lead)':''}</Link>
	}
	var rowstatus	
	var myname=currentuser ? currentuser.displayName:null
	var iAmLeader=leadername.includes(myname) || isAdmin
	var iAmInvolved=iAmLeader||peopleinvolved.includes(myname)
	const status={info:1,warning:2,danger:3}
	var labels=Array.from(function*(){
		for (let t of (category || [])){
			yield {key:t,value:taglist[t],rowstatus:status.default}
		}
		if (values.candisplay!=='Yes') {yield {key:"isinvisible",style:"info",value:"Private"};rowstatus='info'}
		if (values.advertise==='true') {yield {key:'advertise',style:"info",value:"Looking for participants"};rowstatus='info'}
		if (values.caldicott==='pending') {yield {key:"caldicott",style:"warning",value:"Caldicott pending"};rowstatus='warning'}
		if (values.research==='pending') {yield {key:"research",style:"warning",value:"R+D pending"};rowstatus='warning'}
		if (values.leadername.length===0) {yield {key:"needslead",style:"danger",value:"Needs lead"};rowstatus='danger'}
		if (isAdmin && (values.caldicott==='Dontknow'||values.research==='Dontknow')) {yield {key:"needsapproval",style:"danger",value:"Might need approval"};rowstatus='danger'}
		if (values.commit!==true) {yield {key:"needsmoderated",style:"danger",value:"Awaiting moderation"};rowstatus='danger'}
		
	}()).map((r)=>(<span key={r.key}><Label bsStyle={r.style}>{r.value}</Label> </span>))
		
		
	return (<ListGroupItem bsStyle={rowstatus} eventKey={doc.id} onClick={(e)=>{setModalOpen(true);e.stopPropagation()}} header={title}>
                
				{labels}
                <Modal show={modalOpen} onHide={handleHide}>
				<Modal.Header>{title}</Modal.Header>
                <Modal.Body>
                    {description}
                    <hr/>
                    <b>Proposed by: </b>{proposername}<br/>
					{(leadername===undefined || leadername.length===0)? (
					<><b>Project lead: </b>(No leader yet)</>
					):(
					<><b>Project lead{leadername.length>1?'s':''}:</b>{ leadername.join(',')}<br/></>
					)}
					{peopleinvolved && peopleinvolved.length>0?<span><b>Others involved: </b>{peopleinvolved.join(',')}</span>:null}
					<hr/>
					
					{Array.from(function* (self){ 
						if (doc.data().status !== 'complete'){
							if (!currentuser.isAnonymous){
								if(!iAmInvolved){
									yield <Button key={2} onClick={()=>{}}><Glyphicon glyph='thumbs-up'/>Enquire about this</Button>
								}
								if (iAmLeader) {
									yield <Button key={3} componentClass={Link} to={'/edit/'+doc.id} ><Glyphicon glyph='pencil'/> Edit proposal</Button>
									yield <Button key={4} componentClass={Link} to={'/addoutcome/'+doc.id} ><Glyphicon glyph='pencil'/> Add outcome information</Button>
									
								}else{
									yield <Button key={3} componentClass={Link} to={'/view/'+doc.id} ><Glyphicon glyph='pencil'/> View proposal</Button>
									if (values.outcome) {
										yield <Button key={4} componentClass={Link} to={'/viewoutcome/'+doc.id} ><Glyphicon glyph='pencil'/> View outcome information</Button>
									}
								}
						}}
						//yield <Button key={5} componentClass={Link} to={'/moreinfo/'+doc.id}><Glyphicon glyph='info-sign'/>More information</Button>
						yield <Button key={6} onClick={(e)=>{setModalOpen(false);e.stopPropagation()}}>Close</Button>			
					}(this))}
				</Modal.Body>
                </Modal>
				
            </ListGroupItem>)
    }

function DatabaseTable (props) {
    
    const [docs,setDocs]=React.useState([])
	const [statusfilter,setstatusfilter]=React.useState('all')
	const [fallback,setfallback]=React.useState("Loading...");
    const isAdmin=React.useContext(AdminContext)
    React.useEffect(()=>{
		var query=isAdmin?db.collection("privprojects"):db.collection("pubprojects")
		if (!isAdmin){
			query=query.where('candisplay','==','Yes').where('commit','==',true)
		}
		return query.onSnapshot(
			(querySnapshot) => {
				setDocs(querySnapshot.docs)
				setfallback("Nothing to display, sorry")	
        })
    })
		
	if (props.user===null) return null
    var listitems=docs.filter(
		(doc)=>{
			switch (statusfilter){
			case "all":
				return true;
			case "needslead":
				return (doc.data().leadername.length===0)
			case "recruiting":
				return (doc.data().leadername.length===0 || doc.data().advertise==='true')
			default:
				return (statusfilter===doc.data().status)
			}}).map(
				(doc)=> {
					return (<DatabaseRow doc={doc} docdata={doc.data()} visible={props.match && props.match.params===doc.id} key={doc.id}/>)});
		
        return (<div className="App">
			<div>
			<Nav bsStyle="tabs" activeKey={statusfilter} onSelect={k => {setstatusfilter(k)}}>
			<NavItem eventKey="all">All</NavItem>
			<NavItem eventKey="needslead">Needs lead</NavItem>
			<NavItem eventKey="recruiting">Looking for collaborators</NavItem>
			<NavItem eventKey="recentupdate">Recently Updated</NavItem>
			<NavItem eventKey="complete">Completed</NavItem>
			</Nav>
			</div>
			<ListGroup id="accordion-example">{listitems}</ListGroup>
			</div>);
    }

function MyProjects(props){
	return (<div>
		<h3>My Projects</h3>
			<DatabaseTable onlyme />
		
		</div>)
}

function Logout(props){
	firebase.auth().signOut();
	return <Redirect to="/"/>
}

function MessageNav(props){
	return <NavItem eventKey={2.1} componentClass={Link} to="/messages" href="/messages"><Glyphicon glyph="envelope"/> Messages </NavItem>
}

function TopNav (props){
	const user=React.useContext(UserContext)
	const isAdmin=React.useContext(AdminContext)
	var buttons= 	(<Nav>
					{user.isAnonymous?(
					<NavItem eventKey={1} componentClass={Link} to="/login" href="/login">Login 
					<Glyphicon glyph='log-in'/>
					</NavItem>
                    
					):(
					
					<NavItem eventKey={1} componentClass={Link} to="/logout" href="/logout">Logout {user.displayName}{isAdmin?'(admin)':''}<Glyphicon glyph='log-out'/></NavItem>
					)}
                    <NavItem eventKey={3.2} componentClass={Link} to="/addproject" href="/addproject"><Glyphicon glyph='flash'/>Propose Project </NavItem>
                    <NavItem eventKey={3.3} componentClass={Link} to="/" href="/"><Glyphicon glyph='inbox'/>Projects</NavItem>
				
				</Nav>)
					
   
			
    return(<Navbar inverse collapseOnSelect>
        <Navbar.Header>
            <Navbar.Brand>
                <a href="/">People Make QI</a>
				
            </Navbar.Brand>
            <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
		{buttons}
        </Navbar.Collapse>
    </Navbar>)}


function MessageTo (props) {
	db.collection('projects').doc(props.match.params.recipient).get().then()
}

class SendMessage extends React.Component{
	constructor(props){
		super(props)
		this.handleSubmit=this.handleSubmit.bind(this)
		this.state={title:props.title || '',message: props.message || '',show:false,pplinfo:props.pplinfo}
		
		this.handleTitleChange=this.handleChange.bind(this,'title')
		this.handleDescChange=this.handleChange.bind(this,'message')
		this.handleClose=this.handleClose.bind(this)
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
		var currentuser=this.props.user
		if (Math.min(this.state.title.length,this.state.description.length)>0){
			//console.log(currentuser)
			var newrecord={ 
				message:this.state.message, 
				title: this.state.title,
				senderid: [currentuser.uid],
				peopleinfo: this.state.pplinfo,
				unreadby: this.state.pplinfo.map((p)=>(p.uid)),
				sent: new Date(),
				sender: [{uid:currentuser.uid,realname:currentuser.displayName}]}
			db.collection('messages').add(newrecord).then(()=>(this.handleClose()));
			
		}
		if (evt){evt.preventDefault()}
	}
	
	
	render(){
	return (<div>
          <h2 className="App-logo">
            Send Message
          </h2>
          <div>
            
			<form onSubmit={this.handleSubmit}>
        <InputField
          controlId="formTitle"
          label="Project Title"
          componentClass="input"
          placeholder="Message Title"
		  value={this.state.title}
		  validator={()=>(null)}
		  onChange={this.handleTitleChange}
          />
		  
		<InputField
          controlId="formDescription"
          label="Short description"
          componentClass="textarea"
          placeholder="Enter message here"
		  value={this.state.message}
		  validator={()=>(null)}
		  onChange={this.handleDescChange}
          />
          
		
      </form>
            
          </div>
		  <hr/>
          
            <Button onClick={this.handleSubmit}><Glyphicon glyph="ok"/>Send</Button>
			<Button onClick={this.handleClose}><Glyphicon glyph="remove"/>Cancel</Button>
			
          
        </div>

	)}
}

class MoreInfo extends React.Component{
	constructor(props){
		super(props)
		this.state={statuses:[],files:[]}
	}
	componentDidMount(){
		var docref=this.props.match.params.doc
		firebase.firestore().collection('projects').doc(docref).get().then(
			(doc)=>{
				//console.log(doc);
				
				this.setState({statuses:doc.data().statuses || [],
							   files:doc.data().files || [],
							   title:doc.data().title,
							   description:doc.data().description,
							   people:doc.data().people
				})
	})}
	
	render(){ 
		var statuses=this.state.statuses.map((status)=>{
			return (
				<div>
				<h4>{status.title}</h4>
				<i>{Date(status.posted.seconds*1000)}</i>
				<br/>
				{status.description}
				<hr/>
				</div>
				)
		})
		var files=this.state.files.map((f)=>{
			return (
				<Panel eventKey={f.blob}>
                <Panel.Heading>
                    <Panel.Title toggle>{f.filename} </Panel.Title>
                </Panel.Heading>
                <Panel.Body collapsible>
                    {f.description}
                    <hr/>
                    <Button key={5} href={f.url}><Glyphicon glyph='download'/>Download</Button>
					

                </Panel.Body>
				
            </Panel>)
		}
				)
		
		
		return(<div>
		<h3>{this.state.title}</h3>
			{this.state.description}
		{statuses}
			{files.length>0 ? <h4>Files</h4> : null }
		<PanelGroup accordion id="accordion-example">{files}</PanelGroup>
			{(this.state.people || []).includes(this.props.user.uid)?(
				<div>
				<Button componentClass={Link} to={'/addstatus/'+this.props.match.params.doc}> <Glyphicon glyph='pencil'/> Add status update</Button>
				<Button componentClass={Link} to={'/uploadfile/'+this.props.match.params.doc}> <Glyphicon glyph='upload'/> Upload file</Button>
			</div>):null}
			</div>)
}
}	


function ViewProjectForm(props){
	const newprops = Object.assign({},props,{readonly:true})
	return <AddProjectForm {...newprops}/>
}

function ViewOutcomeForm(props){
	const newprops = Object.assign({},props,{readonly:true})
	return <AddOutcomeForm {...newprops}/>
}

class App extends React.Component {
	
    render() {
		
			return (
				<div>
					
					<SigninAssistant>
					
					
					
					<Router>
					<React.Suspense fallback={"Loading..."}>
					<div>
                    <TopNav showbuttons={true}/>
					
					<Col sm={1}/>
					<Col sm={10}>
					
                    <Route exact path="/" component={DatabaseTable}/>
					<Route path="/showpopup/:doc" component={DatabaseTable}/>
					<Route path="/addproject" component={AddProjectForm}/>
					<Route path="/edit/:doc" component={AddProjectForm}/>
					<Route path="/view/:doc" component={ViewProjectForm}/>
					<Route path="/editoutcome/:doc" component={AddOutcomeForm}/>
					<Route path="/addoutcome/:doc" component={AddOutcomeForm}/>
					<Route path="/viewoutcome/:doc" component={ViewOutcomeForm}/>
					<Route path="/myprojects" component={MyProjects}/>
					<Route path="/logout" component={Logout}/>
					<Route path="/login" component={SignInScreen}/>					
					<Route path="/moreinfo/:doc" component={MoreInfo}/>
					<Route path="/addstatus/:doc" component={AddStatus}/>
					<Route path="/uploadfile/:doc" component={FileUploader}/>
					</Col>
					<Col sm={1}/>
					
					
					</div>
					</React.Suspense>
					</Router>
					</SigninAssistant>
					
				</div>
			);
		}
		
	
}

export default App;
